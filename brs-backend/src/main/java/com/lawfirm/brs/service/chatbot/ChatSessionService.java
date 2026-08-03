package com.lawfirm.brs.service.chatbot;

import com.lawfirm.brs.entity.ChatbotMessage;
import com.lawfirm.brs.entity.ChatbotSession;
import com.lawfirm.brs.repository.ChatbotMessageRepository;
import com.lawfirm.brs.repository.ChatbotSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing chatbot sessions, persisted in PostgreSQL.
 *
 * <p>Previous implementation stored everything in Redis with a 30-minute TTL
 * which lost history on restart and made admin-side queries impossible. The
 * DB is now the source of truth so admin tools can list sessions and read
 * full message history.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatSessionService {

    private final ChatbotSessionRepository sessionRepository;
    private final ChatbotMessageRepository messageRepository;

    /**
     * Look up a session by its public sessionId, or create a new one if
     * absent. {@code sessionId} may be null — in that case a fresh UUID is
     * generated and persisted.
     */
    @Transactional
    public ChatbotSession createOrGetSession(String sessionId, String ip, String userAgent, String language) {
        if (sessionId != null && !sessionId.isBlank()) {
            Optional<ChatbotSession> existing = sessionRepository.findBySessionId(sessionId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }
        ChatbotSession session = ChatbotSession.builder()
            .sessionId(sessionId != null && !sessionId.isBlank() ? sessionId : UUID.randomUUID().toString())
            .userIp(ip)
            .userAgent(userAgent)
            .language(language != null && !language.isBlank() ? language : "vi")
            .startedAt(Instant.now())
            .escalated(false)
            .messageCount(0)
            .resolved(false)
            .build();
        return sessionRepository.save(session);
    }

    /**
     * Append a USER, BOT, SYSTEM, or ADMIN message to a session. Each
     * message bumps the session's message_count so admin list views stay
     * cheap.
     */
    @Transactional
    public void addMessage(String sessionId, String role, String content, String intent, Double confidence) {
        addMessage(sessionId, role, content, intent, confidence, null);
    }

    /**
     * Append a message with optional actor id. {@code actorId} is stored on
     * ADMIN/AGENT messages so admin replies can be attributed to the staff
     * member who sent them.
     */
    @Transactional
    public void addMessage(String sessionId, String role, String content, String intent,
            Double confidence, UUID actorId) {
        ChatbotSession session = sessionRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new IllegalStateException("Session not found: " + sessionId));

        ChatbotMessage message = ChatbotMessage.builder()
            .session(session)
            .role(role)
            .content(content)
            .intent(intent)
            .confidence(confidence != null ? BigDecimal.valueOf(confidence) : null)
            .actorId(actorId)
            .retentionUntil(Instant.now().plusSeconds(30L * 24 * 60 * 60))
            .build();
        messageRepository.save(message);

        session.setMessageCount(Optional.ofNullable(session.getMessageCount()).orElse(0) + 1);
        sessionRepository.save(session);
    }

    /**
     * Read the conversation history of a session ordered chronologically.
     */
    @Transactional(readOnly = true)
    public List<Map<String, String>> getHistory(String sessionId) {
        UUID dbId = sessionRepository.findBySessionId(sessionId)
            .map(ChatbotSession::getId)
            .orElse(null);
        if (dbId == null) return List.of();

        List<ChatbotMessage> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(dbId);
        List<Map<String, String>> history = new ArrayList<>(messages.size());
        for (ChatbotMessage m : messages) {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("role", m.getRole());
            row.put("content", m.getContent());
            row.put("timestamp", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");
            if (m.getIntent() != null) row.put("intent", m.getIntent());
            if (m.getConfidence() != null) row.put("confidence", m.getConfidence().toPlainString());
            history.add(row);
        }
        return history;
    }

    /**
     * Mark a session as escalated to a human agent. Idempotent — repeated
     * calls do not stack SYSTEM messages.
     */
    @Transactional
    public void markEscalated(String sessionId) {
        sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            if (Boolean.TRUE.equals(session.getEscalated())) {
                return;
            }
            session.setEscalated(true);
            sessionRepository.save(session);
        });
    }

    /**
     * Mark a session as escalated and record who took it / when.
     * Idempotent — re-assignment updates the assignee rather than stacking messages.
     */
    @Transactional
    public void markEscalatedTo(String sessionId, String to, UUID actorId) {
        sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            boolean wasAlreadyEscalated = Boolean.TRUE.equals(session.getEscalated());
            session.setEscalated(true);
            session.setHandoffTo(to);
            session.setHandoffAt(java.time.Instant.now());
            if (actorId != null) {
                session.setHandoffBy(actorId);
            }
            sessionRepository.save(session);
            if (!wasAlreadyEscalated) {
                String note = to != null && !to.isBlank()
                    ? "Đã chuyển sang nhân viên: " + to
                    : "Đã chuyển sang nhân viên tư vấn.";
                ChatbotMessage sysMsg = ChatbotMessage.builder()
                    .session(session)
                    .role("SYSTEM")
                    .content(note)
                    .intent("HANDOVER")
                    .retentionUntil(java.time.Instant.now().plusSeconds(30L * 24 * 60 * 60))
                    .build();
                messageRepository.save(sysMsg);
                session.setMessageCount(java.util.Optional.ofNullable(session.getMessageCount()).orElse(0) + 1);
                sessionRepository.save(session);
            }
        });
    }

    @Transactional
    public void endSession(String sessionId) {
        sessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            session.endSession();
            sessionRepository.save(session);
        });
    }
}
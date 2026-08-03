package com.lawfirm.brs.service.chatbot;

import com.lawfirm.brs.entity.ChatbotMessage;
import com.lawfirm.brs.entity.ChatbotSession;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.ChatbotMessageRepository;
import com.lawfirm.brs.repository.ChatbotSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for chatbot administration and monitoring.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotAdminService {

    private final ChatbotSessionRepository chatbotSessionRepository;
    private final ChatbotMessageRepository chatbotMessageRepository;

    /**
     * Get chatbot sessions with pagination. When {@code escalated} is set, the
     * date filter ({@code startedAfter}/{@code startedBefore}) is also honored.
     */
    @Transactional(readOnly = true)
    public ChatbotSessionListResult getSessions(int page, int size, Boolean escalated,
            Instant startedAfter, Instant startedBefore) {
        log.debug("Fetching chatbot sessions: page={}, size={}, escalated={}", page, size, escalated);

        Instant from = startedAfter != null ? startedAfter : Instant.EPOCH;
        Instant to = startedBefore != null ? startedBefore : Instant.now();
        Page<ChatbotSession> result;
        if (escalated != null && escalated) {
            result = chatbotSessionRepository
                .findByEscalatedTrueAndStartedAtBetween(from, to, PageRequest.of(page, size));
        } else {
            result = chatbotSessionRepository.findByStartedAtBetween(from, to, PageRequest.of(page, size));
        }
        List<ChatbotSessionSummary> summaries = result.getContent().stream()
            .map(s -> new ChatbotSessionSummary(
                s.getId(), s.getSessionId(), s.getLanguage(),
                s.getStartedAt(), s.getEndedAt(), s.getEscalated(),
                s.getResolved() == null ? false : s.getResolved(),
                s.getMessageCount() == null ? 0 : s.getMessageCount(),
                s.getHandoffTo(),
                s.getHandoffAt(),
                deriveStatus(s)))
            .toList();
        return new ChatbotSessionListResult(summaries, page, size, result.getTotalElements(), result.getTotalPages());
    }

    /**
     * Get chatbot session detail with messages
     */
    @Transactional(readOnly = true)
    public ChatbotSessionDetailResult getSessionDetail(UUID id) {
        log.debug("Fetching chatbot session detail: {}", id);

        ChatbotSession session = chatbotSessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Chatbot session not found: " + id));

        List<ChatbotMessage> messages = chatbotMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        List<ChatbotMessageSummary> summaries = messages.stream()
            .map(m -> new ChatbotMessageSummary(
                m.getId(),
                m.getContent(),
                m.getRole(),
                m.getIntent(),
                m.getActorId(),
                m.getCreatedAt()))
            .toList();

        return new ChatbotSessionDetailResult(
            session.getId(),
            session.getSessionId(),
            session.getUserIp(),
            session.getUserAgent(),
            session.getLanguage(),
            session.getStartedAt(),
            session.getEndedAt(),
            session.getEscalated(),
            session.getHandoffTo(),
            session.getHandoffAt(),
            session.getHandoffBy(),
            summaries);
    }

    /**
     * Get chatbot conversation logs
     */
    public List<ChatbotLogEntry> getLogs(UUID sessionId, int page, int size, Instant from, Instant to) {
        log.debug("Fetching chatbot logs: sessionId={}, page={}, size={}", sessionId, page, size);
        
        // Placeholder - would query ChatbotMessageRepository
        return List.of();
    }

    /**
     * Get chatbot statistics
     */
    public ChatbotStats getStats(Instant from, Instant to) {
        log.debug("Fetching chatbot stats: from={}, to={}", from, to);
        
        // Placeholder - would calculate stats from repository
        return new ChatbotStats(0, 0, 0, 0, 0.0, Map.of());
    }

    /**
     * Get intent distribution statistics
     */
    public List<IntentStat> getIntentStats(Instant from, Instant to) {
        log.debug("Fetching intent stats: from={}, to={}", from, to);
        
        // Placeholder - would calculate intent distribution
        return List.of();
    }

    /**
     * Update chatbot configuration
     */
    public Map<String, Object> updateConfig(Map<String, Object> config) {
        log.debug("Updating chatbot config: {}", config);
        
        // Placeholder - would update configuration in database or cache
        return config;
    }

    /**
     * Get current chatbot configuration
     */
    public Map<String, Object> getConfig() {
        log.debug("Fetching chatbot config");
        
        // Placeholder - would return config from database or cache
        return Map.of(
                "welcomeMessage", "Xin chào! Tôi có thể giúp gì cho bạn?",
                "defaultLanguage", "vi",
                "escalationHours", "08:00-18:00"
        );
    }

    /**
     * Escalate a session to a human agent. Persists the assignee and actor so
     * the UI can show who is currently handling the chat. Idempotent — repeated
     * calls update the assignee instead of stacking message rows. Closed
     * sessions cannot be re-escalated.
     */
    @Transactional
    public void escalateSession(UUID id, String to, UUID actorId, String note) {
        if (id == null) {
            throw new IllegalArgumentException("Session id is required");
        }
        log.debug("Escalating chatbot session: id={}, to={}, actorId={}", id, to, actorId);
        ChatbotSession session = chatbotSessionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Chatbot session not found: " + id));
        if (session.getEndedAt() != null || Boolean.TRUE.equals(session.getResolved())) {
            throw new IllegalStateException("Session is closed; cannot escalate");
        }
        boolean wasAlreadyEscalated = Boolean.TRUE.equals(session.getEscalated());
        session.setEscalated(true);
        if (to != null && !to.isBlank()) {
            session.setHandoffTo(to);
        }
        session.setHandoffAt(java.time.Instant.now());
        if (actorId != null) {
            session.setHandoffBy(actorId);
        }
        chatbotSessionRepository.save(session);

        if (!wasAlreadyEscalated) {
            ChatbotMessage sysMsg = ChatbotMessage.builder()
                .session(session)
                .role("SYSTEM")
                .content(note != null && !note.isBlank()
                    ? "Đã chuyển sang nhân viên " + (to != null ? to : "tư vấn") + ": " + note
                    : "Đã chuyển sang nhân viên " + (to != null ? to : "tư vấn"))
                .intent("ESCALATE")
                .actorId(actorId)
                .retentionUntil(Instant.now().plusSeconds(30L * 24 * 60 * 60))
                .build();
            chatbotMessageRepository.save(sysMsg);
            session.setMessageCount(Optional.ofNullable(session.getMessageCount()).orElse(0) + 1);
            chatbotSessionRepository.save(session);
        }
    }

    /**
     * Close a chatbot session. Idempotent: closing an already-closed session
     * is a no-op (returns false). Returns true when the call actually flipped
     * the session from open to closed.
     */
    @Transactional
    public boolean closeSession(UUID id) {
        log.debug("Closing chatbot session: {}", id);
        return chatbotSessionRepository.findById(id).map(session -> {
            if (session.getEndedAt() != null || Boolean.TRUE.equals(session.getResolved())) {
                return false;
            }
            session.setEndedAt(Instant.now());
            session.setResolved(true);
            chatbotSessionRepository.save(session);
            return true;
        }).orElse(false);
    }

    private String deriveStatus(ChatbotSession s) {
        if (s.getEndedAt() != null || Boolean.TRUE.equals(s.getResolved())) return "CLOSED";
        if (Boolean.TRUE.equals(s.getEscalated())) return "HANDOFF";
        return "ACTIVE";
    }

    /**
     * Append an admin-authored message into a chatbot session.
     * Used when a human agent takes over the conversation.
     * Throws {@link IllegalStateException} when the session is closed —
     * admins should not be able to reply to a conversation the customer has
     * already ended.
     */
    public void appendAdminMessage(UUID sessionId, String content, UUID actorId) {
        log.debug("Admin reply to chatbot session {}: {}", sessionId, content);
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Reply content cannot be empty");
        }
        ChatbotSession session = chatbotSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        if (session.getEndedAt() != null || Boolean.TRUE.equals(session.getResolved())) {
            throw new IllegalStateException("Session is closed; cannot append admin reply");
        }
        ChatbotMessage message = ChatbotMessage.builder()
            .session(session)
            .role("ADMIN")
            .content(content)
            .intent("ADMIN_REPLY")
            .actorId(actorId)
            .retentionUntil(Instant.now().plusSeconds(30L * 24 * 60 * 60))
            .build();
        chatbotMessageRepository.save(message);
        session.setMessageCount(Optional.ofNullable(session.getMessageCount()).orElse(0) + 1);
        chatbotSessionRepository.save(session);
    }

    // Result records
    public record ChatbotSessionListResult(
            List<ChatbotSessionSummary> content,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}

    public record ChatbotSessionSummary(
            UUID id,
            String sessionId,
            String language,
            Instant startedAt,
            Instant endedAt,
            Boolean escalated,
            Boolean resolved,
            Integer messageCount,
            String handoffTo,
            Instant handoffAt,
            String status  // "ACTIVE" | "CLOSED" | "HANDOFF"
    ) {}

    public record ChatbotSessionDetailResult(
            UUID id,
            String sessionId,
            String userIp,
            String userAgent,
            String language,
            Instant startedAt,
            Instant endedAt,
            Boolean escalated,
            String handoffTo,
            Instant handoffAt,
            UUID handoffBy,
            List<ChatbotMessageSummary> messages
    ) {}

    public record ChatbotMessageSummary(
            UUID id,
            String content,
            String from,
            String intent,
            UUID actorId,
            Instant timestamp
    ) {}

    public record ChatbotLogEntry(
            UUID sessionId,
            String sessionKey,
            String sender,
            String content,
            String intent,
            String confidence,
            Instant timestamp
    ) {}

    public record ChatbotStats(
            long totalSessions,
            long activeSessions,
            long escalatedSessions,
            long totalMessages,
            double avgMessagesPerSession,
            Map<String, Long> sessionsByLanguage
    ) {}

    public record IntentStat(String intent, long count, double percentage) {}
}

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
     * Get chatbot sessions with pagination
     */
    @Transactional(readOnly = true)
    public ChatbotSessionListResult getSessions(int page, int size, Boolean escalated,
            Instant startedAfter, Instant startedBefore) {
        log.debug("Fetching chatbot sessions: page={}, size={}, escalated={}", page, size, escalated);

        Instant from = startedAfter != null ? startedAfter : Instant.EPOCH;
        Instant to = startedBefore != null ? startedBefore : Instant.now().plusSeconds(60);
        Page<ChatbotSession> result;
        if (escalated != null && escalated) {
            result = chatbotSessionRepository.findByEscalatedTrue(PageRequest.of(page, size));
        } else {
            result = chatbotSessionRepository.findByStartedAtBetween(from, to, PageRequest.of(page, size));
        }
        List<ChatbotSessionSummary> summaries = result.getContent().stream()
            .map(s -> new ChatbotSessionSummary(
                s.getId(), s.getSessionId(), s.getLanguage(),
                s.getStartedAt(), s.getEndedAt(), s.getEscalated(),
                s.getResolved() == null ? false : s.getResolved(),
                s.getMessageCount() == null ? 0 : s.getMessageCount()))
            .toList();
        return new ChatbotSessionListResult(summaries, page, size, result.getTotalElements());
    }

    /**
     * Get chatbot session detail with messages
     */
    public ChatbotSessionDetailResult getSessionDetail(UUID id) {
        log.debug("Fetching chatbot session detail: {}", id);
        
        // Placeholder - would query session with messages
        throw new UnsupportedOperationException("ChatbotAdminService.getSessionDetail not yet implemented");
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
     * Escalate a session to human agent
     */
    public void escalateSession(UUID id, String note) {
        log.debug("Escalating chatbot session: id={}, note={}", id, note);
        
        // Placeholder - would mark session as escalated and notify CSKH
    }

    /**
     * Close a chatbot session
     */
    public void closeSession(UUID id) {
        log.debug("Closing chatbot session: {}", id);

        // Placeholder - would mark session as ended
    }

    /**
     * Append an admin-authored message into a chatbot session.
     * Used when a human agent takes over the conversation.
     */
    public void appendAdminMessage(UUID sessionId, String content, UUID actorId) {
        log.debug("Admin reply to chatbot session {}: {}", sessionId, content);
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Reply content cannot be empty");
        }
        ChatbotSession session = chatbotSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));
        ChatbotMessage message = ChatbotMessage.builder()
            .session(session)
            .role("ADMIN")
            .content(content)
            .intent("ADMIN_REPLY")
            .retentionUntil(Instant.now().plusSeconds(30L * 24 * 60 * 60))
            .build();
        chatbotMessageRepository.save(message);
        session.setMessageCount(Optional.ofNullable(session.getMessageCount()).orElse(0) + 1);
        chatbotSessionRepository.save(session);
    }

    // Result records
    public record ChatbotSessionListResult(
            List<ChatbotSessionSummary> sessions,
            int page,
            int size,
            long totalElements
    ) {}

    public record ChatbotSessionSummary(
            UUID id,
            String sessionId,
            String language,
            Instant startedAt,
            Instant endedAt,
            Boolean escalated,
            Boolean resolved,
            Integer messageCount
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
            List<ChatbotMessageSummary> messages
    ) {}

    public record ChatbotMessageSummary(
            UUID id,
            String content,
            String sender,
            String intent,
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

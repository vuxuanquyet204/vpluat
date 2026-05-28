package com.lawfirm.brs.service.chatbot;

import com.lawfirm.brs.entity.ChatbotSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Service for managing chatbot sessions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatSessionService {

    private final StringRedisTemplate redis;

    private static final String SESSION_PREFIX = "chatbot:session:";
    private static final String HISTORY_PREFIX = "chatbot:history:";
    private static final Duration SESSION_TTL = Duration.ofMinutes(30);
    private static final int MAX_HISTORY_SIZE = 50;

    public ChatbotSession createOrGetSession(String sessionId, String ip, String userAgent, String language) {
        if (sessionId != null) {
            String key = SESSION_PREFIX + sessionId;
            if (Boolean.TRUE.equals(redis.hasKey(key))) {
                redis.expire(key, SESSION_TTL);
                return getSession(sessionId);
            }
        }

        String newSessionId = sessionId != null ? sessionId : UUID.randomUUID().toString();
        ChatbotSession session = ChatbotSession.builder()
            .sessionId(newSessionId)
            .userIp(ip)
            .userAgent(userAgent)
            .language(language != null ? language : "vi")
            .startedAt(Instant.now())
            .escalated(false)
            .build();

        saveSession(session);
        return session;
    }

    public ChatbotSession getSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        String data = redis.opsForValue().get(key);
        if (data == null) return null;
        return deserializeSession(data);
    }

    public void saveSession(ChatbotSession session) {
        String key = SESSION_PREFIX + session.getSessionId();
        redis.opsForValue().set(key, serializeSession(session), SESSION_TTL);
    }

    public void addMessage(String sessionId, String role, String content, String intent, Double confidence) {
        String historyKey = HISTORY_PREFIX + sessionId;
        Map<String, String> message = new LinkedHashMap<>();
        message.put("role", role);
        message.put("content", content);
        message.put("timestamp", Instant.now().toString());
        if (intent != null) message.put("intent", intent);
        if (confidence != null) message.put("confidence", String.valueOf(confidence));

        redis.opsForList().rightPush(historyKey, serializeMessage(message));
        redis.opsForList().trim(historyKey, -MAX_HISTORY_SIZE, -1);
        redis.expire(historyKey, Duration.ofHours(24));
    }

    public List<Map<String, String>> getHistory(String sessionId) {
        String historyKey = HISTORY_PREFIX + sessionId;
        List<String> messages = redis.opsForList().range(historyKey, 0, -1);
        if (messages == null) return Collections.emptyList();

        List<Map<String, String>> history = new ArrayList<>();
        for (String msg : messages) {
            history.add(deserializeMessage(msg));
        }
        return history;
    }

    public void markEscalated(String sessionId) {
        ChatbotSession session = getSession(sessionId);
        if (session != null) {
            session.setEscalated(true);
            saveSession(session);
        }
    }

    public void endSession(String sessionId) {
        redis.delete(SESSION_PREFIX + sessionId);
        redis.delete(HISTORY_PREFIX + sessionId);
    }

    public boolean isOwner(String sessionId, String providedSessionId) {
        if (providedSessionId == null) return true;
        return sessionId.equals(providedSessionId);
    }

    private String serializeSession(ChatbotSession session) {
        return session.getSessionId() + "|" + 
               (session.getUserIp() != null ? session.getUserIp() : "") + "|" +
               (session.getUserAgent() != null ? session.getUserAgent() : "") + "|" +
               session.getLanguage() + "|" +
               session.getStartedAt().toString() + "|" +
               Boolean.TRUE.equals(session.getEscalated());
    }

    private ChatbotSession deserializeSession(String data) {
        String[] parts = data.split("\\|");
        return ChatbotSession.builder()
            .sessionId(parts[0])
            .userIp(parts.length > 1 ? parts[1] : null)
            .userAgent(parts.length > 2 ? parts[2] : null)
            .language(parts.length > 3 ? parts[3] : "vi")
            .startedAt(parts.length > 4 ? Instant.parse(parts[4]) : Instant.now())
            .escalated(parts.length > 5 ? Boolean.parseBoolean(parts[5]) : false)
            .build();
    }

    private String serializeMessage(Map<String, String> message) {
        StringBuilder sb = new StringBuilder();
        message.forEach((k, v) -> sb.append(k).append(":").append(v != null ? v.replace(":", "\\:").replace("|", "\\|") : "").append("|"));
        return sb.toString();
    }

    private Map<String, String> deserializeMessage(String data) {
        Map<String, String> message = new LinkedHashMap<>();
        String[] pairs = data.split("\\|");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                message.put(kv[0], kv[1].replace("\\:", ":").replace("\\|", "|"));
            }
        }
        return message;
    }
}

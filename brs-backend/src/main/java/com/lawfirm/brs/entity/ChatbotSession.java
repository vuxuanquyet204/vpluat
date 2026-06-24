package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Chatbot session entity.
 */
@Entity
@Table(name = "chatbot_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @Column(name = "user_ip")
    private String userIp;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "language")
    @Builder.Default
    private String language = "vi";

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "escalated")
    @Builder.Default
    private Boolean escalated = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @Column(name = "session_key")
    private String sessionKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "message_count", nullable = false)
    @Builder.Default
    private Integer messageCount = 0;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private Boolean resolved = false;

    @Column(name = "intent_summary", columnDefinition = "jsonb")
    private String intentSummary;

    @PrePersist
    protected void onCreate() {
        startedAt = Instant.now();
    }

    /**
     * End the session
     */
    public void endSession() {
        this.endedAt = Instant.now();
    }

    /**
     * Escalate to human agent
     */
    public void escalate() {
        this.escalated = true;
    }

    /**
     * Check if session is active
     */
    public boolean isActive() {
        return endedAt == null;
    }
}

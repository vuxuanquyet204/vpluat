package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
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

    /**
     * Username of the staff member the session was handed off to.
     * Captured when an admin/CSKH triggers the handoff via the admin UI.
     */
    @Column(name = "handoff_to")
    private String handoffTo;

    /** ISO-8601 timestamp of the original escalation. */
    @Column(name = "handoff_at")
    private Instant handoffAt;

    /** User id of the admin/CSKH who performed the handoff (for audit). */
    @Column(name = "handoff_by")
    private UUID handoffBy;

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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "intent_summary", columnDefinition = "jsonb")
    private Map<String, Object> intentSummary;

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

package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Chatbot message entity.
 */
@Entity
@Table(name = "chatbot_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatbotSession session;

    @Column(name = "role", nullable = false)
    private String role; // USER, BOT, SYSTEM

    @Column(name = "content", nullable = false, length = 4000)
    private String content;

    @Column(name = "intent")
    private String intent;

    @Column(name = "confidence")
    private BigDecimal confidence;

    @Column(name = "retention_until", nullable = false)
    private Instant retentionUntil;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        // Default retention: 30 days if not set
        if (retentionUntil == null) {
            retentionUntil = createdAt.plusSeconds(30 * 24 * 60 * 60);
        }
    }
}

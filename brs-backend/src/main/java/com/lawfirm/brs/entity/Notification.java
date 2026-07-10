package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * In-app notification entity. Used to surface lead/booking/review events
 * to staff & admin users via the bell icon in the topbar.
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_user", columnList = "user_id"),
    @Index(name = "idx_notif_read", columnList = "is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Recipient user id. NULL means broadcast (all staff). */
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "type", nullable = false, length = 40)
    private String type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", length = 1000)
    private String message;

    /** Optional link/anchor to navigate when clicked. */
    @Column(name = "link", length = 500)
    private String link;

    /** Source entity type (lead, booking, review, post...). */
    @Column(name = "entity_type", length = 40)
    private String entityType;

    /** Source entity id. */
    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
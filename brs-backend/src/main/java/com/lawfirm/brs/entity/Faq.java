package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * FAQ entity for frequently asked questions.
 */
@Entity
@Table(name = "faqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    /**
     * Comma-separated chatbot intents for which this FAQ is a fallback suggestion,
     * e.g. {@code "BOOKING,SERVICE_INQUIRY,FAQ"}. Empty/null means the FAQ is only
     * surfaced via semantic search (pg_trgm similarity).
     */
    @Column(name = "suggested_for", length = 500)
    private String suggestedFor;

    /**
     * Kill-switch: when false this FAQ is excluded from chatbot suggestions even if
     * it matches. Admin can disable suggestions without un-publishing the FAQ.
     */
    @Column(name = "suggestion_enabled", nullable = false)
    @Builder.Default
    private Boolean suggestionEnabled = true;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

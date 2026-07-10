package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Outbox event entity for transactional outbox pattern.
 */
@Entity
@Table(name = "outbox_events", indexes = {
    @Index(name = "idx_outbox_processed", columnList = "processed, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "aggregate_type", nullable = false)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private UUID aggregateId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "processed")
    @Builder.Default
    private Boolean processed = false;

    @Column(name = "processed_at")
    private Instant processedAt;

    /**
     * Number of times the OutboxProcessor has tried to handle this event.
     * Used to give up after a few retries so a poison event doesn't churn
     * the queue forever.
     */
    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    /**
     * Last error message captured when handling failed.
     */
    @Column(name = "last_error", length = 1000)
    private String lastError;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    /**
     * Mark event as processed
     */
    public void markProcessed() {
        this.processed = true;
        this.processedAt = Instant.now();
    }
}
package com.lawfirm.brs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Newsletter campaign entity — operational unit for a single email blast.
 * Lifecycle: DRAFT → SCHEDULED → SENDING → SENT (or FAILED).
 *
 * <p>Custom-email lists (segment = {@code CUSTOM}) are persisted as a
 * comma-separated string. Active-subscriber counts and rates are filled
 * in by the send pipeline so the analytics modal can render even for
 * campaigns sent before we had a real ESP integration.
 */
@Entity
@Table(name = "newsletter_campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "template_id")
    private UUID templateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private CampaignSegment segment = CampaignSegment.ALL;

    @Column(name = "custom_emails", columnDefinition = "TEXT")
    private String customEmails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.DRAFT;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "recipient_count", nullable = false)
    @Builder.Default
    private Integer recipientCount = 0;

    @Column(name = "open_rate", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal openRate = BigDecimal.ZERO;

    @Column(name = "click_rate", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal clickRate = BigDecimal.ZERO;

    @Column(name = "bounce_rate", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal bounceRate = BigDecimal.ZERO;

    @Column(name = "unsub_rate", nullable = false, precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal unsubRate = BigDecimal.ZERO;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Targeting segment for the campaign.
     */
    public enum CampaignSegment {
        ALL,
        FDI,
        REALESTATE,
        CUSTOM
    }

    /**
     * Campaign lifecycle state machine.
     */
    public enum CampaignStatus {
        DRAFT,
        SCHEDULED,
        SENDING,
        SENT,
        FAILED
    }
}

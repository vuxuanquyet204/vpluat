package com.lawfirm.brs.entity;

import com.lawfirm.brs.constants.LeadStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Lead entity for CRM and potential customer tracking.
 */
@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "channel")
    private String channel;

    @Column(name = "campaign_id")
    private String campaignId;

    @Column(name = "ad_group_id")
    private String adGroupId;

    @Column(name = "utm_source")
    private String utmSource;

    @Column(name = "utm_medium")
    private String utmMedium;

    @Column(name = "utm_campaign")
    private String utmCampaign;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LeadStatus status = LeadStatus.NEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "duplicate_hash")
    private String duplicateHash;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "first_contact_at")
    private Instant firstContactAt;

    @Column(name = "last_contact_at")
    private Instant lastContactAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Mark first contact made
     */
    public void markContacted() {
        if (firstContactAt == null) {
            firstContactAt = Instant.now();
        }
        lastContactAt = Instant.now();
        if (status == LeadStatus.NEW) {
            status = LeadStatus.CONTACTED;
        }
    }

    /**
     * Check if lead is duplicate
     */
    public boolean isDuplicate() {
        return status == LeadStatus.DUPLICATE;
    }
}

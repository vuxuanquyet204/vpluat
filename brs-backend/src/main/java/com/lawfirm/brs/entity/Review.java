package com.lawfirm.brs.entity;

import com.lawfirm.brs.constants.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Review entity for client testimonials.
 */
@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_role")
    private String clientRole;

    @Column(name = "content_vi", nullable = false, columnDefinition = "TEXT")
    private String contentVi;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "rating")
    private Integer rating;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id")
    private LawyerProfile lawyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "source")
    @Builder.Default
    private String source = "WEBSITE";

    @Column(name = "customer_email")
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    @Column(name = "moderated_at")
    private Instant moderatedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

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
     * Get content based on locale
     */
    public String getContent(String locale) {
        if ("en".equals(locale) && contentEn != null) {
            return contentEn;
        }
        return contentVi;
    }

    /**
     * Approve the review
     */
    public void approve(UUID moderatorId) {
        this.status = ReviewStatus.APPROVED;
        this.isPublished = true;
        this.moderatedBy = moderatorId == null ? null : new User();
        if (moderatorId != null) {
            this.moderatedBy.setId(moderatorId);
        }
        this.moderatedAt = Instant.now();
    }

    /**
     * Reject the review
     */
    public void reject(UUID moderatorId, String reason) {
        this.status = ReviewStatus.REJECTED;
        this.isPublished = false;
        this.rejectionReason = reason;
        if (moderatorId != null) {
            this.moderatedBy = new User();
            this.moderatedBy.setId(moderatorId);
        }
        this.moderatedAt = Instant.now();
    }

    /**
     * Feature the review
     */
    public void feature() {
        this.isFeatured = true;
    }
}

package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Service entity for legal services offered.
 */
@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "name", nullable = false)
    private String name;

    /**
     * Short / long-form description shown on the public service detail page.
     * Nullable so the admin can leave it blank during initial seeding.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Consultation fee in VND. Optional — when null the UI shows "Liên hệ".
     */
    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    /**
     * Estimated delivery time in days. Used by the booking flow for context.
     */
    @Column(name = "duration")
    private Integer duration;

    /**
     * Display category label (e.g. "Doanh nghiệp", "Nhà đất"). Distinct from
     * the {@code parent} FK which represents the hierarchical parent service.
     */
    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "icon")
    private String icon;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ServiceEntity parent;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

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

    /**
     * Soft delete service
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
        this.isActive = false;
    }

    /**
     * Check if service is deleted
     */
    public boolean isDeleted() {
        return deletedAt != null;
    }
}

package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Category entity for organizing posts.
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @Column(name = "meta_title_vi")
    private String metaTitleVi;

    @Column(name = "meta_title_en")
    private String metaTitleEn;

    @Column(name = "meta_desc_vi")
    private String metaDescVi;

    @Column(name = "meta_desc_en")
    private String metaDescEn;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

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
     * Get meta title based on locale
     */
    public String getMetaTitle(String locale) {
        if ("en".equals(locale) && metaTitleEn != null) {
            return metaTitleEn;
        }
        return metaTitleVi;
    }

    /**
     * Get meta description based on locale
     */
    public String getMetaDesc(String locale) {
        if ("en".equals(locale) && metaDescEn != null) {
            return metaDescEn;
        }
        return metaDescVi;
    }
}

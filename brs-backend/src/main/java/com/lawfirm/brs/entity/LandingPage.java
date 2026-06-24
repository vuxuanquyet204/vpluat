package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Marketing landing page with lightweight analytics.
 */
@Entity
@Table(name = "landing_pages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingPage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "title_vi")
    private String titleVi;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "content", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String content = "{}";

    @Column(name = "visit_count", nullable = false)
    @Builder.Default
    private Integer visitCount = 0;

    @Column(name = "conversion_count", nullable = false)
    @Builder.Default
    private Integer conversionCount = 0;

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
}

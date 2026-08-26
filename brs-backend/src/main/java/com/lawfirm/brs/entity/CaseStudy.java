package com.lawfirm.brs.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "case_studies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseStudy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "title_vi")
    private String titleVi;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "excerpt_vi", columnDefinition = "TEXT")
    private String excerptVi;

    @Column(name = "excerpt_en", columnDefinition = "TEXT")
    private String excerptEn;

    @Column(name = "content_vi", columnDefinition = "TEXT")
    private String contentVi;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(length = 500)
    private String outcome;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "og_image_url", length = 1000)
    private String ogImageUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "case_study_services",
        joinColumns = @JoinColumn(name = "case_study_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    @Builder.Default
    private List<ServiceEntity> services = new ArrayList<>();

    @Column(name = "is_published")
    private boolean published;

    @Column(name = "is_featured")
    private boolean featured;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}

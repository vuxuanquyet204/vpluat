package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Job posting entity.
 */
@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "department")
    private String department;

    @Column(name = "location")
    private String location;

    @Column(name = "job_type")
    private String jobType;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    private String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "requirements_vi", columnDefinition = "TEXT")
    private String requirementsVi;

    @Column(name = "requirements_en", columnDefinition = "TEXT")
    private String requirementsEn;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "status")
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "deadline")
    private LocalDate deadline;

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

    public void publish() {
        this.status = "PUBLISHED";
    }

    public void close() {
        this.status = "CLOSED";
    }

    public String getTitle(String locale) {
        if ("en".equals(locale) && titleEn != null) {
            return titleEn;
        }
        return title;
    }
}

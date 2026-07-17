package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Lawyer profile entity with availability management.
 */
@Entity
@Table(name = "lawyer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "bio_vi", columnDefinition = "TEXT")
    private String bioVi;

    @Column(name = "bio_en", columnDefinition = "TEXT")
    private String bioEn;

    @Column(name = "position_vi")
    private String positionVi;

    @Column(name = "position_en")
    private String positionEn;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "bar_number")
    private String barNumber;

    @Column(name = "languages")
    private String[] languages;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isActive = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "working_hours", columnDefinition = "jsonb")
    private Map<String, Object> workingHours;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_ids", columnDefinition = "jsonb")
    private List<UUID> serviceIds;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

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
     * Get display name based on locale
     */
    public String getDisplayName(String locale) {
        if ("en".equals(locale) && nameEn != null) {
            return nameEn;
        }
        return nameVi;
    }

    /**
     * Get position based on locale
     */
    public String getPosition(String locale) {
        if ("en".equals(locale) && positionEn != null) {
            return positionEn;
        }
        return positionVi;
    }

    /**
     * Get bio based on locale
     */
    public String getBio(String locale) {
        if ("en".equals(locale) && bioEn != null) {
            return bioEn;
        }
        return bioVi;
    }
}

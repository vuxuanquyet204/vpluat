package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Date-specific override for a lawyer (vacation, special hours, etc.).
 */
@Entity
@Table(name = "lawyer_schedule_overrides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerScheduleOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;

    @Column(name = "override_date", nullable = false)
    private LocalDate overrideDate;

    @Column(name = "is_off", nullable = false)
    @Builder.Default
    private Boolean isOff = true;

    @Column(name = "slots", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String slots = "[]";

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

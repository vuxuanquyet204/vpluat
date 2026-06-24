package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Recurring weekly schedule for a lawyer.
 * Complements {@link AvailabilitySlot} which stores per-date slots.
 */
@Entity
@Table(name = "lawyer_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LawyerSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 0=Sunday ... 6=Saturday

    @Column(name = "is_off", nullable = false)
    @Builder.Default
    private Boolean isOff = false;

    @Column(name = "slots", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String slots = "[]";

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

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

package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Short-lived hold on an availability slot while a user completes
 * the booking form. Records expire after a TTL (5 minutes by default).
 */
@Entity
@Table(name = "slot_reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SlotReservation {

    public enum Status {
        ACTIVE,
        EXPIRED,
        RELEASED,
        CONVERTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lawyer_id", nullable = false)
    private UUID lawyerId;

    @Column(name = "availability_slot_id", nullable = false)
    private UUID availabilitySlotId;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = Status.ACTIVE;
        }
    }
}

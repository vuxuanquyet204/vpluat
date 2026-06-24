package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks history/audit trail of booking (appointment) changes.
 * Records status changes, reschedules, cancellations, etc.
 */
@Entity
@Table(name = "appointment_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // create, update, status_change, reschedule, cancel, reminder_sent

    @Column(name = "from_value", columnDefinition = "TEXT")
    private String fromValue;

    @Column(name = "to_value", columnDefinition = "TEXT")
    private String toValue;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_name", length = 255)
    private String actorName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

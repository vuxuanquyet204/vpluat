package com.lawfirm.brs.entity;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.constants.MeetingType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Appointment entity for booking management.
 */
@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_email", nullable = false)
    private String clientEmail;

    @Column(name = "client_phone", nullable = false)
    private String clientPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(name = "timezone")
    @Builder.Default
    private String timezone = "Asia/Ho_Chi_Minh";

    @Enumerated(EnumType.STRING)
    @Column(name = "meeting_type", nullable = false)
    @Builder.Default
    private MeetingType meetingType = MeetingType.OFFICE;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "source")
    @Builder.Default
    private String source = "WEBSITE";

    @Column(name = "utm_source")
    private String utmSource;

    @Column(name = "utm_medium")
    private String utmMedium;

    @Column(name = "utm_campaign")
    private String utmCampaign;

    // OTP hashed with SHA-256 [IMPROVED v2]
    @Column(name = "otp_code_hash")
    private String otpCodeHash;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

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

    /**
     * Check if OTP is expired
     */
    public boolean isOtpExpired() {
        return otpExpiresAt != null && otpExpiresAt.isBefore(Instant.now());
    }

    /**
     * Check if appointment can be cancelled
     */
    public boolean canBeCancelled() {
        return status == AppointmentStatus.PENDING || status == AppointmentStatus.CONFIRMED;
    }

    /**
     * Check if OTP is valid
     */
    public boolean isOtpValid(String providedOtp, String hashedOtp) {
        return !isOtpExpired() && otpCodeHash != null && otpCodeHash.equals(hashedOtp);
    }
}

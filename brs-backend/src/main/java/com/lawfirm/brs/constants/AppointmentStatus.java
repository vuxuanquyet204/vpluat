package com.lawfirm.brs.constants;

/**
 * Appointment status values.
 */
public enum AppointmentStatus {
    PENDING,     // Awaiting OTP verification
    CONFIRMED,    // Verified and confirmed
    CANCELLED,   // Cancelled by client or admin
    EXPIRED,     // OTP expired without verification
    COMPLETED,   // Appointment completed
    NO_SHOW      // Client did not attend
}

package com.lawfirm.brs.dto.request;

import com.lawfirm.brs.constants.MeetingType;
import jakarta.validation.constraints.*;

import java.time.Instant;

/**
 * Admin booking request DTO - accepts name/slug instead of UUID.
 */
public record AdminBookingRequest(
    @NotBlank(message = "Client name is required")
    @Size(max = 255, message = "Client name is too long")
    String clientName,

    @NotBlank(message = "Client email is required")
    @Email(message = "Invalid email format")
    String clientEmail,

    @NotBlank(message = "Client phone is required")
    @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Invalid Vietnamese phone number")
    String clientPhone,

    @NotBlank(message = "Lawyer ID or name is required")
    String lawyerId,

    @NotBlank(message = "Service ID or name is required")
    String serviceId,

    @NotNull(message = "Scheduled time is required")
    Instant scheduledAt,

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 240, message = "Duration cannot exceed 240 minutes")
    Integer durationMinutes,

    @NotNull(message = "Meeting type is required")
    MeetingType meetingType,

    String timezone,

    @Size(max = 50, message = "Source is too long")
    String source
) {
    public AdminBookingRequest {
        if (timezone == null) timezone = "Asia/Ho_Chi_Minh";
        if (durationMinutes == null) durationMinutes = 60;
        if (source == null) source = "ADMIN";
    }
}

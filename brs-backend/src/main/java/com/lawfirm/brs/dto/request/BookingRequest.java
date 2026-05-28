package com.lawfirm.brs.dto.request;

import com.lawfirm.brs.constants.MeetingType;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Booking request DTO.
 */
public record BookingRequest(
    @NotBlank(message = "Client name is required")
    @Size(max = 255, message = "Client name is too long")
    String clientName,

    @NotBlank(message = "Client email is required")
    @Email(message = "Invalid email format")
    String clientEmail,

    @NotBlank(message = "Client phone is required")
    @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Invalid Vietnamese phone number")
    String clientPhone,

    @NotNull(message = "Lawyer ID is required")
    UUID lawyerId,

    @NotNull(message = "Service ID is required")
    UUID serviceId,

    @NotNull(message = "Scheduled time is required")
    Instant scheduledAt,

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 240, message = "Duration cannot exceed 240 minutes")
    Integer durationMinutes,

    @NotNull(message = "Meeting type is required")
    MeetingType meetingType,

    String timezone,

    @Size(max = 50, message = "Source is too long")
    String source,

    @Size(max = 100, message = "UTM source is too long")
    String utmSource,

    @Size(max = 100, message = "UTM medium is too long")
    String utmMedium,

    @Size(max = 100, message = "UTM campaign is too long")
    String utmCampaign
) {
    public BookingRequest {
        if (timezone == null) {
            timezone = "Asia/Ho_Chi_Minh";
        }
        if (durationMinutes == null) {
            durationMinutes = 60;
        }
        if (source == null) {
            source = "WEBSITE";
        }
    }
}

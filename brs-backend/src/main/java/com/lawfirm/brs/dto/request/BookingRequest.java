package com.lawfirm.brs.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.lawfirm.brs.constants.MeetingType;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Booking request DTO.
 * Accepts the frontend's nested payload (customer/consultationType)
 * as well as the legacy flat fields.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record BookingRequest(
    @JsonProperty("clientName")
    String clientName,

    @JsonProperty("clientEmail")
    String clientEmail,

    @JsonProperty("clientPhone")
    String clientPhone,

    @JsonProperty("lawyerId")
    UUID lawyerId,

    @JsonProperty("serviceId")
    String serviceId,

    @JsonProperty("scheduledAt")
    Instant scheduledAt,

    @JsonProperty("reservationId")
    UUID reservationId,

    @JsonProperty("durationMinutes")
    Integer durationMinutes,

    @JsonProperty("meetingType")
    MeetingType meetingType,

    String timezone,

    String source,

    String utmSource,

    String utmMedium,

    String utmCampaign,

    /** Client's free-form description of their legal issue (flat field from legacy clients). */
    String issueSummary,

    // Nested customer payload from frontend
    CustomerPayload customer,

    String consultationType
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CustomerPayload(
        String fullName,
        String phone,
        String email,
        String issueSummary
    ) {}

    public BookingRequest {
        // Flatten nested customer into flat fields if present
        if (customer != null) {
            if (isBlank(clientName) && !isBlank(customer.fullName())) {
                clientName = customer.fullName();
            }
            if (isBlank(clientPhone) && !isBlank(customer.phone())) {
                clientPhone = customer.phone();
            }
            if (isBlank(clientEmail) && !isBlank(customer.email())) {
                clientEmail = customer.email();
            }
            if (isBlank(issueSummary) && !isBlank(customer.issueSummary())) {
                issueSummary = customer.issueSummary();
            }
        }

        // Map consultationType -> meetingType if missing
        if (meetingType == null && consultationType != null && !consultationType.isBlank()) {
            try {
                meetingType = MeetingType.valueOf(consultationType.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // Try common aliases
                if (consultationType.equalsIgnoreCase("IN_PERSON")) {
                    meetingType = MeetingType.OFFLINE;
                }
            }
        }

        if (timezone == null || timezone.isBlank()) {
            timezone = "Asia/Ho_Chi_Minh";
        }
        if (durationMinutes == null) {
            durationMinutes = 60;
        }
        if (source == null || source.isBlank()) {
            source = "WEBSITE";
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
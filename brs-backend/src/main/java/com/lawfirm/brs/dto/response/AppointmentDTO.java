package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Appointment DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    private UUID id;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private UUID lawyerId;
    private String lawyerName;
    private UUID serviceId;
    private String serviceName;
    private Instant scheduledAt;
    private Integer durationMinutes;
    private String timezone;
    private String status;
    private String meetingType;
    private String meetingLink;
    private String cancelReason;
    private String source;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private Instant confirmedAt;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean includeOtpDetails;
}

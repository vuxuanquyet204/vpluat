package com.lawfirm.brs.dto.response;

import com.lawfirm.brs.constants.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for appointment summary in dashboard widgets.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentSummaryResponse {
    private UUID id;
    private String clientName;
    private String clientPhone;
    private String lawyerName;
    private Instant scheduledAt;
    private AppointmentStatus status;
    private String serviceType;
    private String notes;
}

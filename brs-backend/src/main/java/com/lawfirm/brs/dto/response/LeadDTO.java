package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Lead DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadDTO {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private UUID serviceId;
    private String serviceName;
    private String message;
    private String source;
    private String channel;
    private String campaignId;
    private String adGroupId;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String status;
    private UUID assignedToId;
    private String assignedToName;
    private Instant firstContactAt;
    private Instant lastContactAt;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}

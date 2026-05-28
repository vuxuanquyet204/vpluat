package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Lead request DTO.
 */
public record LeadRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name is too long")
    String name,

    @Email(message = "Invalid email format")
    String email,

    @Pattern(regexp = "^(\\+84|0)\\d{9,10}$", message = "Invalid Vietnamese phone number")
    String phone,

    String serviceId,

    @Size(max = 5000, message = "Message is too long")
    String message,

    @Size(max = 50, message = "Source is too long")
    String source,

    String channel,
    String campaignId,
    String adGroupId,
    String utmSource,
    String utmMedium,
    String utmCampaign,
    String ipAddress,
    String userAgent
) {
    public LeadRequest {
        if (source == null) {
            source = "WEBSITE";
        }
    }
}

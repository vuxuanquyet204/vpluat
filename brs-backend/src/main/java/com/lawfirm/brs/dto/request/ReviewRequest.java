package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Review request DTO for creating reviews.
 */
public record ReviewRequest(
    @NotBlank(message = "Client name is required")
    @Size(max = 255, message = "Client name is too long")
    String clientName,

    @Size(max = 255, message = "Client role is too long")
    String clientRole,

    @NotBlank(message = "Review content is required")
    @Size(max = 10000, message = "Review content is too long")
    String content,

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    Integer rating,

    String lawyerId,

    String serviceId,

    @Size(max = 50, message = "Source is too long")
    String source
) {}

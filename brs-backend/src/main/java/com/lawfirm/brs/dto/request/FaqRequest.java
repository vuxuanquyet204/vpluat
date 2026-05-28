package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * FAQ request DTO for creating/updating FAQs.
 */
public record FaqRequest(
    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question is too long")
    String question,

    @NotBlank(message = "Answer is required")
    @Size(max = 10000, message = "Answer is too long")
    String answer,

    String serviceId,

    @Min(value = 0, message = "Display order must be positive")
    Integer displayOrder,

    Boolean isPublished
) {}

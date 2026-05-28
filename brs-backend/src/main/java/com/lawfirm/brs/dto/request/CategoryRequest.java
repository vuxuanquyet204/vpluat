package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Category request DTO for creating/updating categories.
 */
public record CategoryRequest(
    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug is too long")
    String slug,

    String parentId,

    @Size(max = 255, message = "Meta title is too long")
    String metaTitleVi,

    @Size(max = 255, message = "Meta title is too long")
    String metaTitleEn,

    @Size(max = 500, message = "Meta description is too long")
    String metaDescVi,

    @Size(max = 500, message = "Meta description is too long")
    String metaDescEn,

    @Min(value = 0, message = "Display order must be positive")
    Integer displayOrder
) {}

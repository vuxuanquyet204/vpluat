package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Service request DTO for creating/updating services.
 */
public record ServiceRequest(
    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug is too long")
    String slug,

    @Size(max = 255, message = "Icon is too long")
    String icon,

    String titleVi,

    String titleEn,

    String excerptVi,

    String excerptEn,

    String contentVi,

    String contentEn,

    String metaTitleVi,

    String metaTitleEn,

    String metaDescVi,

    String metaDescEn,

    String parentId,

    @Min(value = 0, message = "Display order must be positive")
    Integer displayOrder,

    Boolean isFeatured,

    Boolean isActive
) {}

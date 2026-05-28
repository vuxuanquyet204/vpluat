package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Lawyer profile request DTO.
 */
public record LawyerRequest(
    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug is too long")
    String slug,

    @NotBlank(message = "Vietnamese name is required")
    @Size(max = 255, message = "Name is too long")
    String nameVi,

    @Size(max = 255, message = "English name is too long")
    String nameEn,

    String bioVi,

    String bioEn,

    String positionVi,

    String positionEn,

    @Min(value = 0, message = "Experience years must be positive")
    Integer experienceYears,

    @Size(max = 100, message = "Bar number is too long")
    String barNumber,

    String[] languages,

    @Size(max = 500, message = "Avatar URL is too long")
    String avatarUrl,

    Boolean isFeatured,

    String workingHours,

    String userId
) {}

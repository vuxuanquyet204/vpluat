package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

/**
 * Case Study request DTO for creating/updating case studies.
 */
public record CaseStudyRequest(
    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug is too long")
    String slug,

    String titleVi,

    String titleEn,

    String excerptVi,

    String excerptEn,

    String contentVi,

    String contentEn,

    @Size(max = 500, message = "Outcome is too long")
    String outcome,

    @URL(message = "Invalid thumbnail URL")
    @Size(max = 1000, message = "Thumbnail URL is too long")
    String thumbnailUrl,

    @URL(message = "Invalid OG image URL")
    @Size(max = 1000, message = "OG image URL is too long")
    String ogImageUrl,

    Boolean isFeatured,

    Boolean isPublished,

    java.util.List<String> serviceIds
) {}

package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Tag request DTO for creating/updating tags.
 */
public record TagRequest(
    @NotBlank(message = "Slug is required")
    @Size(max = 100, message = "Slug is too long")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    String slug
) {}

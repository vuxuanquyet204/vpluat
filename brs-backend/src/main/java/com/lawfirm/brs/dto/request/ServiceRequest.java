package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service request DTO for creating/updating services.
 *
 * <p>All fields map 1:1 to {@code services} table columns. No synthetic
 * multi-language fields — keep DTO thin so the contract matches the schema
 * exactly (lower memory footprint, less mapping overhead).
 *
 * <p>{@code lawyerIds} is optional and uses PATCH-style semantics so the same
 * DTO can drive both POST (create) and PUT (update) without forcing the
 * caller to send the full assignment list every time. An explicit empty list
 * clears all assignments; a {@code null} leaves the existing assignments
 * untouched.
 */
public record ServiceRequest(
        @NotBlank(message = "Slug is required")
        @Size(max = 255, message = "Slug is too long")
        String slug,

        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name is too long")
        String name,

        @Size(max = 255, message = "Icon is too long")
        String icon,

        UUID parentId,

        @Min(value = 0, message = "Display order must be positive")
        Integer displayOrder,

        Boolean isFeatured,

        Boolean isActive,

        List<UUID> lawyerIds,

        /**
         * Detailed description shown on the public service detail page.
         * Optional — leaving it null keeps the existing value on update.
         */
        String description,

        /**
         * Consultation fee in VND. Optional. Pass null to clear on update.
         */
        BigDecimal price,

        /**
         * Estimated delivery time in days. Optional.
         */
        Integer duration,

        /**
         * Display category label (e.g. "Doanh nghiệp"). Optional.
         */
        @Size(max = 100, message = "Category is too long")
        String category
) {}
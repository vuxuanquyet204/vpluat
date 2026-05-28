package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Job posting request DTO for creating/updating job postings.
 */
public record JobPostingRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title is too long")
    String title,

    String titleEn,

    @Size(max = 255, message = "Department is too long")
    String department,

    @Size(max = 255, message = "Location is too long")
    String location,

    @Size(max = 100, message = "Job type is too long")
    String jobType,

    String descriptionVi,

    String descriptionEn,

    String requirementsVi,

    String requirementsEn,

    @Size(max = 255, message = "Salary range is too long")
    String salaryRange,

    LocalDate deadline,

    @Size(max = 50, message = "Status is too long")
    String status
) {}

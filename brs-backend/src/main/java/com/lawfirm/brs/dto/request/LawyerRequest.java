package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Lawyer profile request DTO.
 * Lưu ý: slug/nameVi để optional để tương thích PATCH - FE vẫn luôn gửi đầy đủ khi CREATE.
 * @see LawyerPatchRequest cho PATCH semantics.
 */
public record LawyerRequest(
    @Size(max = 255)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug chỉ chứa chữ thường, số và dấu gạch ngang (vd: nguyen-van-an)")
    String slug,

    @Size(max = 255, message = "Name is too long")
    String nameVi,

    @Size(max = 255, message = "English name is too long")
    String nameEn,

    String bioVi,

    String bioEn,

    @Size(max = 255, message = "Position VI is too long")
    String positionVi,

    @Size(max = 255, message = "Position EN is too long")
    String positionEn,

    @Min(value = 0, message = "Experience years must be positive")
    Integer experienceYears,

    @Size(max = 100, message = "Bar number is too long")
    String barNumber,

    List<String> languages,

    @Size(max = 5000, message = "Avatar URL is too long")
    String avatarUrl,

    List<UUID> serviceIds,

    Boolean isFeatured,

    Map<String, Object> workingHours,

    // User account fields (optional - if provided, will create/link user)
    String email,

    String password,

    String phone
) {}

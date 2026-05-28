package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Lawyer DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LawyerDTO {

    private UUID id;
    private UUID userId;
    private String userEmail;
    private String slug;
    private String nameVi;
    private String nameEn;
    private String bioVi;
    private String bioEn;
    private String positionVi;
    private String positionEn;
    private Integer experienceYears;
    private String barNumber;
    private String[] languages;
    private String avatarUrl;
    private Boolean isFeatured;
    private String workingHours;
    private Instant createdAt;
}

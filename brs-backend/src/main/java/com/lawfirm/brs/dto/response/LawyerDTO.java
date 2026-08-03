package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
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
    private String phone;
    private String slug;
    private String nameVi;
    private String nameEn;
    private String bioVi;
    private String bioEn;
    private String positionVi;
    private String positionEn;
    private Integer experienceYears;
    private String barNumber;
    private List<String> languages;
    private String avatarUrl;
    private List<UUID> serviceIds;
    /**
     * Tên hiển thị của các dịch vụ tương ứng với {@link #serviceIds} theo cùng thứ tự.
     * FE dùng để hiển thị tên dịch vụ thay vì UUID.
     */
    private List<String> serviceNames;
    /**
     * Slug của các dịch vụ tương ứng với {@link #serviceIds} theo cùng thứ tự.
     * FE dùng để filter/lọc luật sư theo dịch vụ mà không phụ thuộc vào tên hiển thị.
     */
    private List<String> serviceSlugs;
    private Boolean isFeatured;
    private Map<String, Object> workingHours;
    private Instant createdAt;
    private UUID createdById;
    private String createdByName;
    /**
     * Chỉ populate cho response khi BE tự sinh user mới với password mặc định
     * (FE có thể hiển thị cho admin copy). Không persist xuống DB.
     */
    @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
    private String defaultPassword;
}

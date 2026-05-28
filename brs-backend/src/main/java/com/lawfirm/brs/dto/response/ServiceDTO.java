package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Service DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {

    private UUID id;
    private UUID parentId;
    private String slug;
    private String icon;
    private String title;
    private String titleEn;
    private String excerpt;
    private String excerptEn;
    private String content;
    private String contentEn;
    private String metaTitle;
    private String metaTitleEn;
    private String metaDesc;
    private String metaDescEn;
    private Boolean isFeatured;
    private Boolean isActive;
    private Integer displayOrder;
    private Instant createdAt;
    
    private String parentName;
}

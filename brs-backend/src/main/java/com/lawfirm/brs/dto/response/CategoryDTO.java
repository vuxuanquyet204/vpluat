package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Category DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {

    private UUID id;
    private String slug;
    private UUID parentId;
    private String metaTitle;
    private String metaDesc;
    private Integer displayOrder;
    private String metaTitleEn;
    private String metaTitleVi;
    private String metaDescEn;
    private String metaDescVi;

    /**
     * Convenience display fields populated by CategoryMapper so the admin
     * frontend can render names/descriptions without knowing about the
     * localised meta variants.
     */
    private String name;
    private String description;
    private Integer postCount;
}

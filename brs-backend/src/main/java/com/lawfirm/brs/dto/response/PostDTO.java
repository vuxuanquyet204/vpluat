package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Post DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {

    private UUID id;
    private String slug;
    private String thumbnailUrl;
    private UUID authorId;
    private String authorName;
    private UUID categoryId;
    private String categoryName;
    private String title;
    private String excerpt;
    private String content;
    private String status;
    private Instant publishedAt;
    private Instant scheduledAt;
    private Integer views;
    private Integer readingTime;
    private String ogImageUrl;
    private Boolean isFeatured;
    private String language;
    private String metaTitle;
    private String metaDesc;
    private List<String> tags;
    private List<UUID> lawyerIds;
    private Instant createdAt;
    private Instant updatedAt;
}

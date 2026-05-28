package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.List;
import java.util.UUID;

/**
 * Post request DTO for creating/updating posts.
 */
public record PostRequest(
    @Size(max = 255, message = "Slug is too long")
    String slug,

    @Size(max = 1000, message = "Title is too long")
    String title,

    @Size(max = 500, message = "Excerpt is too long")
    String excerpt,

    String content,

    @Size(max = 1000, message = "Thumbnail URL is too long")
    @URL(message = "Invalid thumbnail URL")
    String thumbnailUrl,

    UUID categoryId,

    String status,

    @Min(value = 0, message = "Views cannot be negative")
    Integer views,

    @Min(value = 0, message = "Reading time cannot be negative")
    Integer readingTime,

    @Size(max = 1000, message = "OG image URL is too long")
    @URL(message = "Invalid OG image URL")
    String ogImageUrl,

    Boolean isFeatured,

    @Size(min = 2, max = 5, message = "Language code must be between 2 and 5 characters")
    String language,

    @Size(max = 255, message = "Meta title is too long")
    String metaTitle,

    @Size(max = 500, message = "Meta description is too long")
    String metaDesc,

    List<String> tags,

    List<UUID> lawyerIds,

    String publishAt,

    String scheduledAt
) {}

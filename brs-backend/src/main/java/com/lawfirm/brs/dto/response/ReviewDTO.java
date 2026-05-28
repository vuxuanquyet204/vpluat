package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Review DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {

    private UUID id;
    private String clientName;
    private String clientRole;
    private String content;
    private Integer rating;
    private UUID lawyerId;
    private String lawyerName;
    private UUID serviceId;
    private String serviceName;
    private Boolean isFeatured;
    private Boolean isPublished;
    private String source;
    private Instant createdAt;
}

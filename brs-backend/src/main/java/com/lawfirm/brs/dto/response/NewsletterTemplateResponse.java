package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Newsletter template DTO returned to admin clients.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterTemplateResponse {
    private UUID id;
    private String name;
    private String subject;
    private String body;
    private String description;
    private Boolean isDefault;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

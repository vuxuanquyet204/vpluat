package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO returned by /api/notifications endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String type;
    private String title;
    private String message;
    private String link;
    private String entityType;
    private String entityId;
    private boolean isRead;
    private Instant createdAt;
}
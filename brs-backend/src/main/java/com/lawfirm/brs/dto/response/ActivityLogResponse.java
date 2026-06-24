package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Recent system activity entry, shown on dashboard "activity feed" widget.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private UUID id;
    private String actorName;
    private String action;
    private String entityType;
    private UUID entityId;
    private String summary;
    private Instant createdAt;
}

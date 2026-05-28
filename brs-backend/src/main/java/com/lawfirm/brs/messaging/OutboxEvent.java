package com.lawfirm.brs.messaging;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Event published to outbox for async processing.
 */
@Data
@Builder
public class OutboxEvent {

    private UUID id;
    private String aggregateType;
    private UUID aggregateId;
    private String eventType;
    private Map<String, Object> payload;
    private Instant createdAt;
    private boolean processed;
    private Instant processedAt;
}

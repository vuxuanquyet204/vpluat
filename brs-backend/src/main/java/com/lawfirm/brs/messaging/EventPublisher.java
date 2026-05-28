package com.lawfirm.brs.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.brs.entity.OutboxEvent;
import com.lawfirm.brs.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Publisher for outbox events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void publish(Object aggregate, String eventType) {
        publish(aggregate.getClass().getSimpleName(), getAggregateId(aggregate), eventType, Map.of());
    }

    @Transactional
    public void publish(Object aggregate, String eventType, Map<String, Object> payload) {
        publish(aggregate.getClass().getSimpleName(), getAggregateId(aggregate), eventType, payload);
    }

    @Transactional
    public void publish(String aggregateType, UUID aggregateId, String eventType, Map<String, Object> payload) {
        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            payloadJson = "{}";
        }
        OutboxEvent event = OutboxEvent.builder()
            .aggregateType(aggregateType)
            .aggregateId(aggregateId)
            .eventType(eventType)
            .payload(payloadJson)
            .createdAt(Instant.now())
            .processed(false)
            .build();

        outboxRepository.save(event);
        log.debug("Published event: {} - {} - {}", aggregateType, aggregateId, eventType);
    }

    private UUID getAggregateId(Object aggregate) {
        try {
            return (UUID) aggregate.getClass().getMethod("getId").invoke(aggregate);
        } catch (Exception e) {
            log.warn("Could not get aggregate ID", e);
            return null;
        }
    }
}

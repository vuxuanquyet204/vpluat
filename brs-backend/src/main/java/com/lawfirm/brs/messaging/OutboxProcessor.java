package com.lawfirm.brs.messaging;

import com.lawfirm.brs.entity.OutboxEvent;
import com.lawfirm.brs.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Processor for outbox events.
 *
 * Each iteration of the scheduler runs in its OWN transaction so failed
 * events don't poison the whole batch and successful ones are committed
 * even if a sibling event throws.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxEventRepository outboxRepository;
    private final NotificationEventHandler eventHandler;

    /**
     * Don't re-process the same event forever if it keeps failing.
     * After this many retries, the event is marked processed to keep the
     * queue from growing unbounded.
     */
    @Value("${app.outbox.max-retries:5}")
    private int maxRetries;

    @Scheduled(fixedDelay = 10_000L)
    public void processOutbox() {
        List<OutboxEvent> events = outboxRepository.findTop50ByProcessedFalseOrderByCreatedAtAsc();

        if (events.isEmpty()) {
            return;
        }

        log.debug("Processing {} outbox events", events.size());

        for (OutboxEvent event : events) {
            try {
                // Each event in its own transaction so one failure doesn't
                // roll back the whole batch.
                markOne(event);
            } catch (Exception e) {
                log.error("Failed to process event {} after retries: {}", event.getId(), e.getMessage());
            }
        }
    }

    @Transactional
    public void markOne(OutboxEvent event) {
        // Re-fetch within the transaction so we have a managed entity
        OutboxEvent managed = outboxRepository.findById(event.getId()).orElse(null);
        if (managed == null || Boolean.TRUE.equals(managed.getProcessed())) {
            return;
        }
        try {
            eventHandler.handle(managed);
        } catch (Exception handlerEx) {
            // Bump retry count; if we've retried too many times, mark
            // processed anyway so we don't churn the same event forever
            // and burn CPU/RAM.
            int retries = managed.getRetryCount() == null ? 1 : managed.getRetryCount() + 1;
            managed.setRetryCount(retries);
            if (retries >= maxRetries) {
                managed.setProcessed(true);
                managed.setProcessedAt(Instant.now());
                managed.setLastError(handlerEx.getMessage());
                log.warn("Event {} reached max retries ({}); marking as processed", managed.getId(), retries);
            } else {
                outboxRepository.save(managed);
                return;
            }
        }
        managed.setProcessed(true);
        managed.setProcessedAt(Instant.now());
        outboxRepository.save(managed);
    }
}
package com.lawfirm.brs.messaging;

import com.lawfirm.brs.entity.OutboxEvent;
import com.lawfirm.brs.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Processor for outbox events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxEventRepository outboxRepository;
    private final NotificationEventHandler eventHandler;

    @Scheduled(fixedDelay = 1000)
    @Transactional
    public void processOutbox() {
        List<OutboxEvent> events = outboxRepository.findTop50ByProcessedFalseOrderByCreatedAtAsc();
        
        if (events.isEmpty()) return;

        log.debug("Processing {} outbox events", events.size());

        for (OutboxEvent event : events) {
            try {
                eventHandler.handle(event);
                event.setProcessed(true);
                event.setProcessedAt(java.time.Instant.now());
                log.debug("Processed event: {}", event.getId());
            } catch (Exception e) {
                log.error("Failed to process event: {}", event.getId(), e);
            }
        }

        outboxRepository.saveAll(events);
    }
}

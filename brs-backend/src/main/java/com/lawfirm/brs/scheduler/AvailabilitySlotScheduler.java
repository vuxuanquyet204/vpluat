package com.lawfirm.brs.scheduler;

import com.lawfirm.brs.service.booking.AvailabilitySlotGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Auto-generate availability slots for all active lawyers.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySlotScheduler {

    private final AvailabilitySlotGeneratorService slotGeneratorService;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        log.info("Initializing availability slots on startup...");
        slotGeneratorService.generateSlotsForActiveLawyers();
    }

    @Scheduled(cron = "0 0 0 * * *") // Run at midnight every day
    public void generateSlotsForActiveLawyers() {
        slotGeneratorService.generateSlotsForActiveLawyers();
    }
}

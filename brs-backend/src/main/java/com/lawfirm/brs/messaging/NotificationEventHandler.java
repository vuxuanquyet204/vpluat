package com.lawfirm.brs.messaging;

import com.lawfirm.brs.entity.OutboxEvent;
import com.lawfirm.brs.service.notification.EmailService;
import com.lawfirm.brs.service.notification.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Handler for notification events.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventHandler {

    private final EmailService emailService;
    private final SmsService smsService;

    public void handle(OutboxEvent event) {
        log.info("Handling event: {} - {} - {}", 
            event.getAggregateType(), event.getAggregateId(), event.getEventType());

        switch (event.getEventType()) {
            case "AppointmentCreated" -> handleAppointmentCreated(event);
            case "AppointmentConfirmed" -> handleAppointmentConfirmed(event);
            case "AppointmentReminder" -> handleAppointmentReminder(event);
            case "AppointmentCancelled" -> handleAppointmentCancelled(event);
            case "LeadCreated" -> handleLeadCreated(event);
            default -> log.warn("Unknown event type: {}", event.getEventType());
        }
    }

    private void handleAppointmentCreated(OutboxEvent event) {
        log.info("Appointment created: {}", event.getAggregateId());
    }

    private void handleAppointmentConfirmed(OutboxEvent event) {
        log.info("Appointment confirmed: {}", event.getAggregateId());
    }

    private void handleAppointmentReminder(OutboxEvent event) {
        log.info("Appointment reminder: {}", event.getAggregateId());
    }

    private void handleAppointmentCancelled(OutboxEvent event) {
        log.info("Appointment cancelled: {}", event.getAggregateId());
    }

    private void handleLeadCreated(OutboxEvent event) {
        log.info("Lead created: {}", event.getAggregateId());
    }
}

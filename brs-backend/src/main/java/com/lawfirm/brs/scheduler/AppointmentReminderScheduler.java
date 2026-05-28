package com.lawfirm.brs.scheduler;

import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.service.notification.EmailService;
import com.lawfirm.brs.service.notification.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Scheduler for appointment-related automated tasks.
 * Handles email/SMS reminders and auto-cancellation of unconfirmed appointments.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    /**
     * Send email reminders for appointments scheduled 24 hours from now.
     * Runs daily at 9:00 AM.
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendEmailReminders() {
        log.debug("Running email reminder scheduler...");
        
        Instant tomorrow = Instant.now().plusSeconds(86400);
        Instant tomorrowEnd = tomorrow.plusSeconds(3600);
        
        List<Appointment> appointments = appointmentRepository
            .findConfirmedAppointmentsInRange(tomorrow, tomorrowEnd);
        
        for (Appointment appt : appointments) {
            try {
                String dateTime = DATE_TIME_FORMATTER.format(appt.getScheduledAt());
                String lawyerName = appt.getLawyer() != null ?
                    appt.getLawyer().getDisplayName("vi") : "Luật sư";
                
                emailService.sendAppointmentReminder(
                    appt.getClientEmail(),
                    appt.getClientName(),
                    dateTime,
                    lawyerName
                );
                log.info("Email reminder sent for appointment: {}", appt.getId());
            } catch (Exception e) {
                log.error("Failed to send email reminder for: {}", appt.getId(), e);
            }
        }
        
        log.info("Email reminder scheduler completed. Processed {} appointments.", appointments.size());
    }

    /**
     * Send SMS reminders for appointments scheduled 2 hours from now.
     * Runs every 30 minutes.
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void sendSmsReminders() {
        log.debug("Running SMS reminder scheduler...");
        
        Instant twoHoursLater = Instant.now().plusSeconds(7200);
        Instant twoHoursLaterEnd = twoHoursLater.plusSeconds(1800);
        
        List<Appointment> appointments = appointmentRepository
            .findConfirmedAppointmentsInRange(twoHoursLater, twoHoursLaterEnd);
        
        for (Appointment appt : appointments) {
            try {
                String dateTime = DATE_TIME_FORMATTER.format(appt.getScheduledAt());
                smsService.sendAppointmentReminder(appt.getClientPhone(), dateTime);
                log.info("SMS reminder sent for appointment: {}", appt.getId());
            } catch (Exception e) {
                log.error("Failed to send SMS reminder for: {}", appt.getId(), e);
            }
        }
        
        log.info("SMS reminder scheduler completed. Processed {} appointments.", appointments.size());
    }

    /**
     * Auto-cancel appointments that remain PENDING for more than 4 hours past scheduled time.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void autoCancelUnconfirmed() {
        log.debug("Running auto-cancel scheduler...");
        
        Instant fourHoursAgo = Instant.now().minusSeconds(14400);
        
        List<Appointment> appointments = appointmentRepository
            .findPendingAppointmentsOlderThan(fourHoursAgo);
        
        int cancelledCount = 0;
        for (Appointment appt : appointments) {
            appt.setStatus(AppointmentStatus.CANCELLED);
            appt.setCancelReason("Auto-cancelled: not confirmed within 4 hours");
            appointmentRepository.save(appt);
            cancelledCount++;
            log.info("Auto-cancelled unconfirmed appointment: {}", appt.getId());
        }
        
        log.info("Auto-cancel scheduler completed. Cancelled {} appointments.", cancelledCount);
    }
}

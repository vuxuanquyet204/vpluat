package com.lawfirm.brs.service.booking;

import com.lawfirm.brs.dto.response.BookingHistoryDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.entity.AppointmentHistory;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.AppointmentHistoryRepository;
import com.lawfirm.brs.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing booking (appointment) history/audit trail.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingHistoryService {

    private final AppointmentHistoryRepository historyRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public List<BookingHistoryDTO> getHistory(UUID appointmentId) {
        log.debug("Fetching history for appointment: {}", appointmentId);

        if (!appointmentRepository.existsById(appointmentId)) {
            throw new ResourceNotFoundException("Appointment not found: " + appointmentId);
        }

        return historyRepository.findByAppointmentIdOrderByCreatedAtDesc(appointmentId)
            .stream()
            .map(this::toDTO)
            .toList();
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordCreate(Appointment appointment, UUID actorId, String actorName) {
        createHistory(appointment, "create", null, null, null, actorId, actorName);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordStatusChange(Appointment appointment, String oldStatus, String newStatus,
            UUID actorId, String actorName) {
        createHistory(appointment, "status_change", oldStatus, newStatus, null, actorId, actorName);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordReschedule(Appointment appointment, String oldTime, String newTime,
            String reason, UUID actorId, String actorName) {
        createHistory(appointment, "reschedule", oldTime, newTime, reason, actorId, actorName);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordCancel(Appointment appointment, String reason,
            UUID actorId, String actorName) {
        createHistory(appointment, "cancel", null, null, reason, actorId, actorName);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordReminderSent(Appointment appointment, String reminderType,
            UUID actorId, String actorName) {
        createHistory(appointment, "reminder_sent", null, reminderType, null, actorId, actorName);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordUpdate(Appointment appointment, String fromValue, String toValue,
            UUID actorId, String actorName) {
        createHistory(appointment, "update", fromValue, toValue, null, actorId, actorName);
    }

    private void createHistory(Appointment appointment, String type, String fromValue, String toValue,
            String reason, UUID actorId, String actorName) {
        AppointmentHistory history = AppointmentHistory.builder()
            .appointment(appointment)
            .type(type)
            .fromValue(fromValue)
            .toValue(toValue)
            .reason(reason)
            .actorId(actorId)
            .actorName(actorName)
            .build();

        historyRepository.save(history);
        log.debug("Recorded history: type={}, appointmentId={}", type, appointment.getId());
    }

    private BookingHistoryDTO toDTO(AppointmentHistory history) {
        return new BookingHistoryDTO(
            history.getId(),
            history.getAppointment() != null ? history.getAppointment().getId() : null,
            history.getType(),
            history.getFromValue(),
            history.getToValue(),
            history.getReason(),
            history.getActorId(),
            history.getActorName(),
            history.getCreatedAt() != null
                ? history.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                : null
        );
    }
}

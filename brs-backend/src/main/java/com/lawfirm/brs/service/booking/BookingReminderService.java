package com.lawfirm.brs.service.booking;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.brs.dto.response.BookingReminderConfigDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing booking reminder configurations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingReminderService {

    private static final String DEFAULT_REMINDER_CONFIG = """
        [
            {"type": "24h", "enabled": true, "channel": "email"},
            {"type": "2h", "enabled": true, "channel": "email"},
            {"type": "30min", "enabled": false, "channel": "email"}
        ]
        """;

    private final AppointmentRepository appointmentRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public BookingReminderConfigDTO getConfig(UUID appointmentId) {
        log.debug("Fetching reminder config for appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        List<BookingReminderConfigDTO.ReminderConfig> reminders = parseReminders(appointment.getReminders());

        return new BookingReminderConfigDTO(appointmentId, reminders);
    }

    @Transactional
    public BookingReminderConfigDTO updateConfig(UUID appointmentId,
            List<BookingReminderConfigDTO.ReminderConfig> reminders) {
        log.info("Updating reminder config for appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        appointment.setReminders(toJson(reminders));
        appointmentRepository.save(appointment);

        log.info("Reminder config updated for appointment: {}", appointmentId);

        return new BookingReminderConfigDTO(appointmentId, reminders);
    }

    private List<BookingReminderConfigDTO.ReminderConfig> parseReminders(String json) {
        if (json == null || json.isBlank()) {
            return parseDefault();
        }
        try {
            return objectMapper.readValue(json,
                new TypeReference<List<BookingReminderConfigDTO.ReminderConfig>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse reminders config: {}", json, e);
            return parseDefault();
        }
    }

    private List<BookingReminderConfigDTO.ReminderConfig> parseDefault() {
        try {
            return objectMapper.readValue(DEFAULT_REMINDER_CONFIG,
                new TypeReference<List<BookingReminderConfigDTO.ReminderConfig>>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse default reminder config", e);
            return new ArrayList<>();
        }
    }

    private String toJson(List<BookingReminderConfigDTO.ReminderConfig> reminders) {
        try {
            return objectMapper.writeValueAsString(reminders);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize reminder config", e);
            return "[]";
        }
    }
}

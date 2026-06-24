package com.lawfirm.brs.dto.response;

import java.util.List;
import java.util.UUID;

/**
 * DTO for booking reminder configuration.
 */
public record BookingReminderConfigDTO(
    UUID appointmentId,
    List<ReminderConfig> reminders
) {
    public record ReminderConfig(String type, boolean enabled, String channel) {}

    public record ReminderConfigRequest(List<ReminderConfig> reminders) {}
}

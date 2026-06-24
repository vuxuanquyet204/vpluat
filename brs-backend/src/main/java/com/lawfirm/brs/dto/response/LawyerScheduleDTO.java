package com.lawfirm.brs.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for lawyer weekly schedule.
 */
public record LawyerScheduleDTO(
    UUID id,
    UUID lawyerId,
    String lawyerName,
    int dayOfWeek,
    boolean isOff,
    List<TimeSlot> slots,
    LocalDate effectiveFrom,
    LocalDate effectiveTo,
    String note
) {
    public record TimeSlot(String start, String end) {}

    public record SlotUpdate(int dayOfWeek, boolean isOff, List<TimeSlot> slots, String note) {}
}

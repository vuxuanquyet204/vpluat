package com.lawfirm.brs.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for lawyer schedule override (vacation, special hours).
 */
public record LawyerScheduleOverrideDTO(
    UUID id,
    UUID lawyerId,
    String lawyerName,
    LocalDate overrideDate,
    String type,
    List<LawyerScheduleDTO.TimeSlot> slots,
    String reason,
    LocalDateTime createdAt
) {}

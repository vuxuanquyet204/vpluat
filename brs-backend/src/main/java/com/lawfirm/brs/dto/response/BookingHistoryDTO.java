package com.lawfirm.brs.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for booking history/audit trail.
 */
public record BookingHistoryDTO(
    UUID id,
    UUID appointmentId,
    String type,
    String fromValue,
    String toValue,
    String reason,
    UUID actorId,
    String actorName,
    LocalDateTime createdAt
) {}

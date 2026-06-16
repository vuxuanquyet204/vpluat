package com.lawfirm.brs.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Reservation record returned to the client. Mirrors what the
 * frontend `BookingReservation` type expects.
 */
@Builder
public record BookingReservationDTO(
        UUID reservationId,
        UUID slotId,
        UUID lawyerId,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        Instant expiresAt,
        String status
) {}

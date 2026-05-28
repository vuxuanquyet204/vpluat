package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Availability slot creation request DTO.
 */
public record AvailabilitySlotRequest(
    @NotNull(message = "Lawyer ID is required")
    UUID lawyerId,

    @NotNull(message = "Slot date is required")
    LocalDate slotDate,

    @NotNull(message = "Start time is required")
    LocalTime startTime,

    @NotNull(message = "End time is required")
    LocalTime endTime,

    Integer slotDuration
) {}

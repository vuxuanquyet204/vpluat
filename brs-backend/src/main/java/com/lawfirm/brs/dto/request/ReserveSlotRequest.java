package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request to place a short-lived hold on an availability slot.
 * The slot must be active and unreserved at the time of the call.
 */
public record ReserveSlotRequest(
        @NotNull UUID lawyerId,
        @NotNull LocalDate date,
        @NotBlank String slotId
) {}

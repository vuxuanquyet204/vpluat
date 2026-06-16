package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to release a previously held slot reservation.
 */
public record ReleaseReservationRequest(
        @NotNull UUID reservationId
) {}

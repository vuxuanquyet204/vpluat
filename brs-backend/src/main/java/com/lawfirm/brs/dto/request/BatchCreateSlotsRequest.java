package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record BatchCreateSlotsRequest(
        @NotNull(message = "Lawyer ID is required")
        UUID lawyerId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate
) {}

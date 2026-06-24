package com.lawfirm.brs.dto.response;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for booking statistics.
 */
public record BookingStatsDTO(
    LocalDate date,
    long total,
    long pending,
    long confirmed,
    long completed,
    long cancelled,
    List<AppointmentDTO> todayAppointments
) {}

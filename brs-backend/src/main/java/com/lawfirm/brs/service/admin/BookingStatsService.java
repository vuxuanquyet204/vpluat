package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.dto.response.BookingStatsDTO;
import com.lawfirm.brs.mapper.AppointmentMapper;
import com.lawfirm.brs.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Service for booking statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingStatsService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    @Transactional(readOnly = true)
    public BookingStatsDTO getStats(LocalDate date) {
        log.debug("Fetching booking stats for date: {}", date);

        Instant startOfDay = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<AppointmentDTO> todayAppointments = appointmentRepository
            .findByScheduledAtBetween(startOfDay, endOfDay)
            .stream()
            .map(appointmentMapper::toDTO)
            .toList();

        long total = todayAppointments.size();
        long pending = todayAppointments.stream()
            .filter(a -> "PENDING".equals(a.getStatus())).count();
        long confirmed = todayAppointments.stream()
            .filter(a -> "CONFIRMED".equals(a.getStatus())).count();
        long completed = todayAppointments.stream()
            .filter(a -> "COMPLETED".equals(a.getStatus())).count();
        long cancelled = todayAppointments.stream()
            .filter(a -> "CANCELLED".equals(a.getStatus())).count();

        return new BookingStatsDTO(
            date,
            total,
            pending,
            confirmed,
            completed,
            cancelled,
            todayAppointments
        );
    }
}

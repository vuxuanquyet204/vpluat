package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.constants.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Appointment repository.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    List<Appointment> findByLawyerIdAndScheduledAtBetween(
        UUID lawyerId, 
        Instant startDate, 
        Instant endDate
    );

    List<Appointment> findByClientPhoneAndScheduledAtAfter(
        String clientPhone, 
        Instant after
    );

    long countByStatus(AppointmentStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' " +
        "AND a.scheduledAt >= :start AND a.scheduledAt < :end"
    )
    List<Appointment> findConfirmedAppointmentsInRange(
        java.time.Instant start, 
        java.time.Instant end
    );

    @org.springframework.data.jpa.repository.Query(
        "SELECT a FROM Appointment a WHERE a.status = 'PENDING' " +
        "AND a.scheduledAt < :cutoff"
    )
    List<Appointment> findPendingAppointmentsOlderThan(java.time.Instant cutoff);
}

package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.constants.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT a FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.scheduledAt BETWEEN :startDate AND :endDate")
    List<Appointment> findByLawyerIdAndScheduledAtBetween(
        @Param("lawyerId") UUID lawyerId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    List<Appointment> findByClientPhoneAndScheduledAtAfter(
        String clientPhone,
        Instant after
    );

    long countByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' " +
           "AND a.scheduledAt >= :start AND a.scheduledAt < :end")
    List<Appointment> findConfirmedAppointmentsInRange(
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    @Query("SELECT a FROM Appointment a WHERE a.status = 'PENDING' " +
           "AND a.scheduledAt < :cutoff")
    List<Appointment> findPendingAppointmentsOlderThan(@Param("cutoff") Instant cutoff);
}

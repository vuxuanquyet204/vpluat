package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.constants.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Appointment repository.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.lawyer LEFT JOIN FETCH a.service")
    Page<Appointment> findAllWithDetails(Pageable pageable);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.lawyer LEFT JOIN FETCH a.service WHERE a.status = :status")
    Page<Appointment> findByStatusWithDetails(@Param("status") AppointmentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"lawyer", "service"})
    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"lawyer", "service"})
    @Override
    Page<Appointment> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"lawyer", "service"})
    Optional<Appointment> findById(UUID id);

    @Query("SELECT a FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.scheduledAt BETWEEN :startDate AND :endDate")
    List<Appointment> findByLawyerIdAndScheduledAtBetween(
        @Param("lawyerId") UUID lawyerId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    @EntityGraph(attributePaths = {"lawyer", "service"})
    @Query("SELECT a FROM Appointment a WHERE a.scheduledAt >= :from AND a.scheduledAt < :to ORDER BY a.scheduledAt ASC")
    List<Appointment> findByScheduledAtBetweenWithDetails(
        @Param("from") Instant from,
        @Param("to") Instant to
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

    long countByStatusAndScheduledAtBetween(
        AppointmentStatus status, Instant from, Instant to);

    long countByScheduledAtBetween(Instant from, Instant to);

    long countByStatusAndScheduledAt(
        AppointmentStatus status, Instant from);

    long countByStatusAndScheduledAtAfter(
        AppointmentStatus status, Instant from);

    List<Appointment> findByScheduledAtBetween(Instant from, Instant to);
}

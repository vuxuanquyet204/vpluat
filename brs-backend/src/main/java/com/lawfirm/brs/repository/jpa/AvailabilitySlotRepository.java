package com.lawfirm.brs.repository.jpa;

import com.lawfirm.brs.entity.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Availability slot repository.
 */
@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    @Query("SELECT s FROM AvailabilitySlot s WHERE s.lawyer.id = :lawyerId " +
           "AND s.slotDate >= :fromDate AND s.slotDate <= :toDate AND s.isAvailable = true " +
           "ORDER BY s.slotDate, s.startTime")
    List<AvailabilitySlot> findAvailableSlots(UUID lawyerId, LocalDate fromDate, LocalDate toDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM AvailabilitySlot s WHERE s.id = :id")
    Optional<AvailabilitySlot> findByIdWithLock(UUID id);

    boolean existsByLawyerIdAndSlotDateAndStartTime(UUID lawyerId, LocalDate slotDate, LocalTime startTime);

    @Query("SELECT s FROM AvailabilitySlot s WHERE s.lawyer.id = :lawyerId AND s.slotDate = :slotDate ORDER BY s.startTime")
    List<AvailabilitySlot> findByLawyerIdAndSlotDate(UUID lawyerId, LocalDate slotDate);

    @Query("SELECT s FROM AvailabilitySlot s WHERE s.appointment.id = :appointmentId")
    Optional<AvailabilitySlot> findByAppointmentId(UUID appointmentId);
}

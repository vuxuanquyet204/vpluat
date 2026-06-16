package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.SlotReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotReservationRepository extends JpaRepository<SlotReservation, UUID> {

    @Query("SELECT r FROM SlotReservation r " +
           "WHERE r.lawyerId = :lawyerId " +
           "AND r.slotDate = :slotDate " +
           "AND r.startTime = :startTime " +
           "AND r.status = com.lawfirm.brs.entity.SlotReservation$Status.ACTIVE " +
           "AND r.expiresAt > :now")
    Optional<SlotReservation> findActive(
            @Param("lawyerId") UUID lawyerId,
            @Param("slotDate") LocalDate slotDate,
            @Param("startTime") LocalTime startTime,
            @Param("now") Instant now);

    @Query("SELECT r FROM SlotReservation r " +
           "WHERE r.status = com.lawfirm.brs.entity.SlotReservation$Status.ACTIVE " +
           "AND r.expiresAt <= :now")
    List<SlotReservation> findExpired(@Param("now") Instant now);
}

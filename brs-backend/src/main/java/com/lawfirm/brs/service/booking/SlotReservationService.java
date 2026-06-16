package com.lawfirm.brs.service.booking;

import com.lawfirm.brs.dto.response.BookingReservationDTO;
import com.lawfirm.brs.entity.AvailabilitySlot;
import com.lawfirm.brs.entity.SlotReservation;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.AvailabilitySlotRepository;
import com.lawfirm.brs.repository.SlotReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Manages short-lived holds on availability slots.
 *
 * The flow:
 *  1. User picks a slot and we call {@link #reserve(UUID, LocalDate, UUID)}.
 *     We mark the slot as unavailable and create an ACTIVE reservation
 *     with an expiresAt 5 minutes in the future.
 *  2. While the user fills out the customer form, the reservation is polled
 *     via {@link #verify(UUID)} to refresh its expiry.
 *  3. Either the user submits a booking (TODO: convert to appointment and
 *     mark the reservation CONVERTED) or cancels, in which case we call
 *     {@link #release(UUID)} to free the slot.
 *
 * A scheduled task expires stale ACTIVE reservations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlotReservationService {

    private static final Duration RESERVATION_TTL = Duration.ofMinutes(5);

    private final SlotReservationRepository reservationRepository;
    private final AvailabilitySlotRepository slotRepository;

    /**
     * Place a hold on a slot. The slot is taken from the global list of
     * active reservations, so two concurrent requests for the same slot
     * cannot both succeed.
     */
    @Transactional
    public BookingReservationDTO reserve(UUID lawyerId, LocalDate date, UUID slotId) {
        Instant now = Instant.now();
        sweepExpiredLocked(now);

        AvailabilitySlot slot = slotRepository.findByIdWithLock(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + slotId));

        if (!slot.getLawyer().getId().equals(lawyerId)) {
            throw new BusinessException("SLOT_LAWYER_MISMATCH",
                    "Slot does not belong to the requested lawyer");
        }
        if (Boolean.FALSE.equals(slot.getIsAvailable()) || slot.getAppointment() != null) {
            throw new BusinessException("SLOT_ALREADY_BOOKED", "This slot is no longer available");
        }

        // Another session may already have an active hold for the same slot.
        reservationRepository.findActive(
                slot.getLawyer().getId(), slot.getSlotDate(), slot.getStartTime(), now
        ).ifPresent(existing -> {
            throw new BusinessException("SLOT_RESERVED", "This slot is being held by another user");
        });

        // Mark slot as taken for the duration of the hold.
        slot.setIsAvailable(false);
        slotRepository.save(slot);

        SlotReservation reservation = SlotReservation.builder()
                .lawyerId(slot.getLawyer().getId())
                .availabilitySlotId(slot.getId())
                .slotDate(slot.getSlotDate())
                .startTime(slot.getStartTime())
                .status(SlotReservation.Status.ACTIVE)
                .expiresAt(now.plus(RESERVATION_TTL))
                .build();

        reservation = reservationRepository.save(reservation);
        log.info("Reserved slot {} for lawyer {} until {}",
                slot.getId(), slot.getLawyer().getId(), reservation.getExpiresAt());

        return toDto(reservation, slot);
    }

    /**
     * Refresh a reservation's expiry and return its current status.
     */
    @Transactional
    public BookingReservationDTO verify(UUID reservationId) {
        SlotReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found: " + reservationId));

        Instant now = Instant.now();

        switch (reservation.getStatus()) {
            case RELEASED -> {
                throw new BusinessException("RESERVATION_RELEASED", "Reservation was released");
            }
            case CONVERTED -> {
                throw new BusinessException("RESERVATION_CONVERTED", "Reservation was already converted");
            }
            case EXPIRED -> {
                throw new BusinessException("RESERVATION_EXPIRED", "Reservation has expired");
            }
            case ACTIVE -> {
                if (reservation.getExpiresAt().isBefore(now)) {
                    reservation.setStatus(SlotReservation.Status.EXPIRED);
                    freeSlot(reservation);
                    reservationRepository.save(reservation);
                    throw new BusinessException("RESERVATION_EXPIRED", "Reservation has expired");
                }
                // Refresh expiry on verify so an active user does not lose the slot.
                reservation.setExpiresAt(now.plus(RESERVATION_TTL));
                reservationRepository.save(reservation);
            }
        }

        AvailabilitySlot slot = slotRepository.findById(reservation.getAvailabilitySlotId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Slot not found: " + reservation.getAvailabilitySlotId()));
        return toDto(reservation, slot);
    }

    /**
     * Release a reservation early (user navigated away / picked another slot).
     */
    @Transactional
    public void release(UUID reservationId) {
        SlotReservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found: " + reservationId));

        if (reservation.getStatus() != SlotReservation.Status.ACTIVE) {
            log.debug("Reservation {} is already in status {}; skipping release",
                    reservationId, reservation.getStatus());
            return;
        }

        reservation.setStatus(SlotReservation.Status.RELEASED);
        reservation.setReleasedAt(Instant.now());
        reservationRepository.save(reservation);
        freeSlot(reservation);
        log.info("Released reservation {}", reservationId);
    }

    private void freeSlot(SlotReservation reservation) {
        slotRepository.findById(reservation.getAvailabilitySlotId())
                .ifPresent(slot -> {
                    if (slot.getAppointment() == null) {
                        slot.setIsAvailable(true);
                        slotRepository.save(slot);
                    }
                });
    }

    /**
     * Periodic sweep: every minute, mark stale ACTIVE reservations as EXPIRED
     * and free their slots. This guards against crashed client processes that
     * never call release/verify.
     */
    @Scheduled(fixedDelay = 60_000L)
    @Transactional
    public void sweepExpired() {
        sweepExpiredLocked(Instant.now());
    }

    private void sweepExpiredLocked(Instant now) {
        List<SlotReservation> expired = reservationRepository.findExpired(now);
        if (expired.isEmpty()) {
            return;
        }
        log.info("Expiring {} stale slot reservations", expired.size());
        for (SlotReservation reservation : expired) {
            reservation.setStatus(SlotReservation.Status.EXPIRED);
            freeSlot(reservation);
        }
        reservationRepository.saveAll(expired);
    }

    private BookingReservationDTO toDto(SlotReservation reservation, AvailabilitySlot slot) {
        return BookingReservationDTO.builder()
                .reservationId(reservation.getId())
                .slotId(slot.getId())
                .lawyerId(reservation.getLawyerId())
                .date(reservation.getSlotDate())
                .startTime(reservation.getStartTime())
                .endTime(slot.getEndTime())
                .expiresAt(reservation.getExpiresAt())
                .status(reservation.getStatus().name().toLowerCase())
                .build();
    }
}

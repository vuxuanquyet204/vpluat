package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.constants.LeadStatus;
import com.lawfirm.brs.dto.request.AdminBookingRequest;
import com.lawfirm.brs.dto.request.BookingRequest;
import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.AppointmentMapper;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Admin-side booking extensions: reschedule, calendar view, admin override create.
 * Sits alongside {@link com.lawfirm.brs.service.booking.BookingService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingErpService {

    private final AppointmentRepository appointmentRepository;
    private final LawyerProfileRepository lawyerRepository;
    private final ServiceEntityRepository serviceRepository;
    private final LeadRepository leadRepository;
    private final AppointmentMapper appointmentMapper;

    /**
     * Reschedule a booking to a new time/duration.
     */
    public AppointmentDTO reschedule(UUID id, Instant newTime, Integer durationMinutes, String reason) {
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (appt.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot reschedule a cancelled booking");
        }
        appt.setScheduledAt(newTime);
        if (durationMinutes != null && durationMinutes > 0) {
            appt.setDurationMinutes(durationMinutes);
        }
        appt.setInternalNotes(appendNote(appt.getInternalNotes(),
            "Rescheduled to " + newTime + (reason == null ? "" : " — " + reason)));
        return appointmentMapper.toDTO(appointmentRepository.save(appt));
    }

    /**
     * Bookings for the date range, optionally filtered by lawyer.
     * Returned in chronological order — suitable for a calendar UI.
     */
    @Transactional(readOnly = true)
    public List<AppointmentDTO> calendar(UUID lawyerId, Instant from, Instant to) {
        List<Appointment> appts;
        if (lawyerId != null) {
            appts = appointmentRepository.findByLawyerIdAndScheduledAtBetween(lawyerId, from, to);
        } else {
            appts = appointmentRepository.findByScheduledAtBetweenWithDetails(from, to);
        }
        return appointmentMapper.toDTOList(appts);
    }

    /**
     * Admin override — create a confirmed booking without going through the
     * public OTP flow. Useful for walk-in or phone-booked appointments.
     * Accepts UUID or name/slug for lawyer and service.
     */
    public AppointmentDTO adminCreate(AdminBookingRequest request) {
        log.info("Admin creating booking for {}", request.clientEmail());

        LawyerProfile lawyer = findLawyer(request.lawyerId());
        ServiceEntity service = findService(request.serviceId());

        Appointment appt = Appointment.builder()
            .clientName(request.clientName())
            .clientEmail(request.clientEmail())
            .clientPhone(request.clientPhone())
            .lawyer(lawyer)
            .service(service)
            .scheduledAt(request.scheduledAt())
            .durationMinutes(request.durationMinutes() == null ? 60 : request.durationMinutes())
            .timezone(request.timezone() == null ? "Asia/Ho_Chi_Minh" : request.timezone())
            .status(AppointmentStatus.CONFIRMED)
            .source("ADMIN")
            .confirmedAt(Instant.now())
            .internalNotes("Created by admin override")
            .build();

        Appointment saved = appointmentRepository.save(appt);
        log.info("Created booking {} for {}", saved.getId(), saved.getClientEmail());

        // Auto-create Lead in CRM for this booking
        Lead lead = Lead.builder()
            .name(request.clientName())
            .email(request.clientEmail())
            .phone(request.clientPhone())
            .source("DIRECT")
            .status(LeadStatus.WON)
            .service(service)
            .notes("Booking confirmed: " + saved.getScheduledAt())
            .build();
        Lead savedLead = leadRepository.save(lead);
        log.info("Auto-created lead {} for booking {}", savedLead.getId(), saved.getId());

        return appointmentMapper.toDTO(saved);
    }

    private LawyerProfile findLawyer(String lawyerIdOrName) {
        if (lawyerIdOrName == null || lawyerIdOrName.isBlank()) {
            throw new IllegalArgumentException("lawyerId is required");
        }
        try {
            UUID uuid = UUID.fromString(lawyerIdOrName);
            return lawyerRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + lawyerIdOrName));
        } catch (IllegalArgumentException e) {
            return lawyerRepository.findByDisplayNameContaining(lawyerIdOrName)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + lawyerIdOrName));
        }
    }

    private ServiceEntity findService(String serviceIdOrSlug) {
        if (serviceIdOrSlug == null || serviceIdOrSlug.isBlank()) {
            throw new IllegalArgumentException("serviceId is required");
        }
        try {
            UUID uuid = UUID.fromString(serviceIdOrSlug);
            return serviceRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceIdOrSlug));
        } catch (IllegalArgumentException e) {
            return serviceRepository.findBySlug(serviceIdOrSlug)
                .or(() -> serviceRepository.findByNameIgnoreCase(serviceIdOrSlug))
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceIdOrSlug));
        }
    }

    private String appendNote(String existing, String note) {
        if (existing == null || existing.isBlank()) return note;
        return existing + "\n[" + Instant.now() + "] " + note;
    }
}

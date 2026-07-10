package com.lawfirm.brs.service.booking;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.constants.LeadStatus;
import com.lawfirm.brs.dto.request.BookingRequest;
import com.lawfirm.brs.dto.request.OtpVerifyRequest;
import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.entity.AvailabilitySlot;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.AppointmentMapper;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.repository.AvailabilitySlotRepository;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.repository.SlotReservationRepository;
import com.lawfirm.brs.service.auth.OtpService;
import com.lawfirm.brs.service.crm.LeadService;
import com.lawfirm.brs.service.notification.EmailService;
import com.lawfirm.brs.service.notification.InAppNotificationService;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for booking appointments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository slotRepository;
    private final LawyerProfileRepository lawyerRepository;
    private final ServiceEntityRepository serviceRepository;
    private final SlotReservationRepository slotReservationRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final AppointmentMapper appointmentMapper;
    private final LeadService leadService;
    private final InAppNotificationService notificationService;

    @Transactional
    public AppointmentDTO createBooking(BookingRequest request) {
        log.info("Creating booking for client: {}", request.clientEmail());

        LawyerProfile lawyer = lawyerRepository.findById(request.lawyerId())
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + request.lawyerId()));

        ServiceEntity service = resolveService(request.serviceId());

        Instant scheduledAt = resolveScheduledAt(request);

        Appointment appointment = Appointment.builder()
            .clientName(request.clientName())
            .clientEmail(request.clientEmail())
            .clientPhone(request.clientPhone())
            .lawyer(lawyer)
            .service(service)
            .scheduledAt(scheduledAt)
            .durationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60)
            .timezone(request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh")
            .meetingType(request.meetingType())
            .source(request.source() != null ? request.source() : "WEBSITE")
            .utmSource(request.utmSource())
            .utmMedium(request.utmMedium())
            .utmCampaign(request.utmCampaign())
            .issueSummary(request.issueSummary())
            .status(AppointmentStatus.PENDING)
            .build();

        appointment = appointmentRepository.save(appointment);

        // Ensure the booking has a corresponding Lead in CRM so it shows up
        // on the Lead management page right after creation.
        try {
            Lead lead = leadService.findOrCreateLeadForBooking(
                request.clientName(),
                request.clientEmail(),
                request.clientPhone(),
                service,
                request.source() != null ? request.source() : "WEBSITE",
                request.utmSource(),
                request.utmMedium(),
                request.utmCampaign(),
                LeadStatus.NEW,
                "Auto-created from booking " + appointment.getId() + " (pending)"
            );
            appointment.setLead(lead);
            appointment = appointmentRepository.save(appointment);
        } catch (Exception ex) {
            log.warn("Failed to link lead for booking {}: {}", appointment.getId(), ex.getMessage());
        }

        String otp = otpService.generateOtp(appointment.getId(), request.clientPhone());
        log.info("OTP generated for appointment {}: {}", appointment.getId(), otp);

        try {
            notificationService.notifyBookingCreatedSafely(appointment.getId(), appointment.getClientName());
        } catch (Exception ex) {
            log.warn("Failed to create notification for new booking {}: {}", appointment.getId(), ex.getMessage());
        }

        AppointmentDTO dto = appointmentMapper.toDTO(appointment);
        return dto;
    }

    @Transactional
    public AppointmentDTO verifyOtp(UUID appointmentId, String otpCode) {
        log.info("Verifying OTP for appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BusinessException("APPOINTMENT_ALREADY_CONFIRMED", 
                "Appointment is already confirmed");
        }

        if (!otpService.verifyOtp(appointmentId, otpCode)) {
            throw new BusinessException("INVALID_OTP", "Invalid or expired OTP");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedAt(Instant.now());
        appointment = appointmentRepository.save(appointment);

        log.info("Appointment {} verified successfully", appointmentId);

        return appointmentMapper.toDTO(appointment);
    }

    @Transactional
    public AppointmentDTO resendOtp(UUID appointmentId) {
        log.info("Resending OTP for appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BusinessException("INVALID_STATE", 
                "Cannot resend OTP for non-pending appointment");
        }

        String otp = otpService.resendOtp(appointmentId, appointment.getClientPhone());
        log.info("New OTP generated for appointment {}: {}", appointmentId, otp);

        return appointmentMapper.toDTO(appointment);
    }

    @Transactional
    public AppointmentDTO cancelAppointment(UUID appointmentId, String reason) {
        log.info("Cancelling appointment: {}", appointmentId);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (!appointment.canBeCancelled()) {
            throw new BusinessException("APPOINTMENT_CANNOT_CANCEL", 
                "This appointment cannot be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelReason(reason);
        appointment = appointmentRepository.save(appointment);

        otpService.deleteOtp(appointmentId);

        // Send cancellation email to customer
        if (appointment.getClientEmail() != null && !appointment.getClientEmail().isBlank()) {
            String dateTime = "N/A";
            if (appointment.getScheduledAt() != null) {
                var vietZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
                dateTime = java.time.ZonedDateTime.ofInstant(appointment.getScheduledAt(), vietZone)
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
            String lawyerName = appointment.getLawyer() != null 
                ? appointment.getLawyer().getDisplayName("vi") 
                : "Van Phong Luat";
            String serviceName = appointment.getService() != null 
                ? appointment.getService().getName() 
                : null;

            emailService.sendAppointmentCancellation(
                appointment.getClientEmail(),
                appointment.getClientName(),
                dateTime,
                lawyerName,
                serviceName,
                reason
            );
        }

        log.info("Appointment {} cancelled successfully", appointmentId);

        return appointmentMapper.toDTO(appointment);
    }

    public AppointmentDTO getAppointmentById(UUID appointmentId) {
        log.debug("Fetching appointment: {}", appointmentId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));
        return appointmentMapper.toDTOWithDetails(appointment);
    }

    public Page<AppointmentDTO> getAllAppointments(int page, int size, String status) {
        log.debug("Fetching appointments: page={}, size={}, status={}", page, size, status);
        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> appointments;

        if (status != null && !status.isEmpty()) {
            appointments = appointmentRepository.findByStatusWithDetails(
                AppointmentStatus.valueOf(status), pageable);
        } else {
            appointments = appointmentRepository.findAllWithDetails(pageable);
        }

        return appointments.map(appointmentMapper::toDTO);
    }

    @Transactional
    public AppointmentDTO updateAppointmentStatus(UUID appointmentId, AppointmentStatus newStatus, String notes) {
        log.info("Updating appointment {} status to: {}", appointmentId, newStatus);

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        if (notes != null && !notes.isBlank()) {
            String existingNotes = appointment.getInternalNotes() != null
                ? appointment.getInternalNotes() + "\n" : "";
            appointment.setInternalNotes(existingNotes + "[" + Instant.now() + "] " + notes);
        }
        if (newStatus == AppointmentStatus.CANCELLED) {
            appointment.setCancelReason(notes);
        }

        appointment = appointmentRepository.save(appointment);

        // Send cancellation email when status transitions to CANCELLED
        if (newStatus == AppointmentStatus.CANCELLED
                && previousStatus != AppointmentStatus.CANCELLED
                && appointment.getClientEmail() != null
                && !appointment.getClientEmail().isBlank()) {
            String dateTime = "N/A";
            if (appointment.getScheduledAt() != null) {
                var vietZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
                dateTime = java.time.ZonedDateTime.ofInstant(appointment.getScheduledAt(), vietZone)
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
            String lawyerName = appointment.getLawyer() != null
                ? appointment.getLawyer().getDisplayName("vi")
                : "Van Phong Luat";
            String serviceName = appointment.getService() != null
                ? appointment.getService().getName()
                : null;

            emailService.sendAppointmentCancellation(
                appointment.getClientEmail(),
                appointment.getClientName(),
                dateTime,
                lawyerName,
                serviceName,
                notes
            );
        }

        return appointmentMapper.toDTO(appointment);
    }

    private ServiceEntity resolveService(String serviceIdOrSlug) {
        if (serviceIdOrSlug == null || serviceIdOrSlug.isBlank()) {
            throw new ResourceNotFoundException("Service ID or slug is required");
        }
        // Try by UUID first
        try {
            UUID id = UUID.fromString(serviceIdOrSlug);
            return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceIdOrSlug));
        } catch (IllegalArgumentException ignored) {
            // Not a UUID, try by slug
        }

        // 1) Try exact slug
        var byExactSlug = serviceRepository.findBySlugAndDeletedAtIsNull(serviceIdOrSlug);
        if (byExactSlug.isPresent()) {
            return byExactSlug.get();
        }

        // 2) Try stripping common prefix (e.g. "service-dat-dai" -> "dat-dai")
        String stripped = serviceIdOrSlug;
        if (stripped.startsWith("service-")) {
            stripped = stripped.substring("service-".length());
            var byStripped = serviceRepository.findBySlugAndDeletedAtIsNull(stripped);
            if (byStripped.isPresent()) {
                return byStripped.get();
            }
        }

        // 3) Try adding "service-" prefix
        if (!serviceIdOrSlug.startsWith("service-")) {
            var withPrefix = serviceRepository.findBySlugAndDeletedAtIsNull("service-" + serviceIdOrSlug);
            if (withPrefix.isPresent()) {
                return withPrefix.get();
            }
        }

        throw new ResourceNotFoundException("Service not found: " + serviceIdOrSlug);
    }

    /**
     * Derive the scheduledAt instant from the booking request.
     * Priority:
     *   1. Explicit scheduledAt in the request
     *   2. The slot referenced by reservationId (slotDate + startTime in the request's timezone)
     * Throws BusinessException if neither is available.
     */
    private Instant resolveScheduledAt(BookingRequest request) {
        if (request.scheduledAt() != null) {
            return request.scheduledAt();
        }
        if (request.reservationId() == null) {
            throw new BusinessException("MISSING_SCHEDULE",
                "Either scheduledAt or reservationId must be provided");
        }
        var reservation = slotReservationRepository.findById(request.reservationId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Reservation not found: " + request.reservationId()));
        ZoneId zone = ZoneId.of(request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh");
        LocalDateTime ldt = LocalDateTime.of(reservation.getSlotDate(), reservation.getStartTime());
        return ldt.atZone(zone).toInstant();
    }

    public List<AppointmentDTO> getBookingsByLeadId(UUID leadId) {
        log.debug("Fetching appointments for lead: {}", leadId);
        return appointmentRepository.findByLeadIdOrderByScheduledAtDesc(leadId)
            .stream()
            .map(appointmentMapper::toDTO)
            .toList();
    }
}

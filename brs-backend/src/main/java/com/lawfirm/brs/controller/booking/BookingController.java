package com.lawfirm.brs.controller.booking;

import com.lawfirm.brs.dto.request.AdminBookingRequest;
import com.lawfirm.brs.dto.request.BookingRequest;
import com.lawfirm.brs.dto.request.OtpVerifyRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.dto.response.BookingHistoryDTO;
import com.lawfirm.brs.dto.response.BookingReminderConfigDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.service.admin.BookingStatsService;
import com.lawfirm.brs.service.booking.BookingHistoryService;
import com.lawfirm.brs.service.booking.BookingReminderService;
import com.lawfirm.brs.service.booking.BookingService;
import com.lawfirm.brs.service.erp.BookingErpService;
import com.lawfirm.brs.service.notification.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Controller for appointment booking.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Appointment booking endpoints")
public class BookingController {

    private final BookingService bookingService;
    private final BookingErpService bookingErp;
    private final BookingHistoryService bookingHistoryService;
    private final BookingReminderService bookingReminderService;
    private final BookingStatsService bookingStatsService;
    private final EmailService emailService;

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createBooking(
            @Valid @RequestBody BookingRequest request) {
        AppointmentDTO booking = bookingService.createBooking(request);
        return ResponseEntity.ok(ApiResponse.success("Booking created. Please verify with OTP.", booking));
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify OTP for booking")
    public ResponseEntity<ApiResponse<AppointmentDTO>> verifyOtp(
            @PathVariable UUID id,
            @Valid @RequestBody OtpVerifyRequest request) {
        AppointmentDTO booking = bookingService.verifyOtp(id, request.otpCode());
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed successfully.", booking));
    }

    @PostMapping("/{id}/resend-otp")
    @Operation(summary = "Resend OTP for booking")
    public ResponseEntity<ApiResponse<AppointmentDTO>> resendOtp(@PathVariable UUID id) {
        AppointmentDTO booking = bookingService.resendOtp(id);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully.", booking));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelBooking(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        AppointmentDTO booking = bookingService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully.", booking));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getBooking(@PathVariable UUID id) {
        AppointmentDTO booking = bookingService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get all bookings with pagination")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDTO>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Page<AppointmentDTO> bookings = bookingService.getAllAppointments(page, size, status);
        PageResponse<AppointmentDTO> response = PageResponse.of(
            bookings.getContent(),
            page,
            size,
            bookings.getTotalElements()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateStatusRequest request) {
        AppointmentDTO booking = bookingService.updateAppointmentStatus(
            id,
            com.lawfirm.brs.constants.AppointmentStatus.valueOf(request.status()),
            request.notes()
        );
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully.", booking));
    }

    @PostMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH', 'LAWYER')")
    @Operation(summary = "Reschedule a booking to a new date/time")
    public ResponseEntity<ApiResponse<AppointmentDTO>> reschedule(
            @PathVariable UUID id,
            @RequestBody RescheduleRequest request) {
        AppointmentDTO booking = bookingErp.reschedule(id,
            request.newScheduledAt(), request.durationMinutes(), request.reason());
        return ResponseEntity.ok(ApiResponse.success("Booking rescheduled", booking));
    }

    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH', 'LAWYER')")
    @Operation(summary = "List bookings for a date range as calendar events")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> calendar(
            @RequestParam(required = false) UUID lawyerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant fromI = from.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        Instant toI = to.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        return ResponseEntity.ok(ApiResponse.success(
            bookingErp.calendar(lawyerId, fromI, toI)));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Admin override: create booking without OTP")
    public ResponseEntity<ApiResponse<AppointmentDTO>> adminCreate(
            @Valid @RequestBody AdminBookingRequest request) {
        AppointmentDTO booking = bookingErp.adminCreate(request);
        return ResponseEntity.ok(ApiResponse.success("Booking created by admin", booking));
    }

    // === Booking History ===

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH', 'LAWYER')")
    @Operation(summary = "Get booking history/audit trail")
    public ResponseEntity<ApiResponse<List<BookingHistoryDTO>>> getHistory(@PathVariable UUID id) {
        List<BookingHistoryDTO> history = bookingHistoryService.getHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // === Booking Reminders ===

    @GetMapping("/{id}/reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH', 'LAWYER')")
    @Operation(summary = "Get reminder configuration for a booking")
    public ResponseEntity<ApiResponse<BookingReminderConfigDTO>> getReminders(@PathVariable UUID id) {
        BookingReminderConfigDTO config = bookingReminderService.getConfig(id);
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PatchMapping("/{id}/reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Update reminder configuration for a booking")
    public ResponseEntity<ApiResponse<BookingReminderConfigDTO>> updateReminders(
            @PathVariable UUID id,
            @RequestBody BookingReminderConfigDTO.ReminderConfigRequest request) {
        BookingReminderConfigDTO config = bookingReminderService.updateConfig(id, request.reminders());
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PostMapping("/{id}/send-confirmation-email")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Send appointment confirmation email to customer")
    public ResponseEntity<ApiResponse<String>> sendConfirmationEmail(@PathVariable UUID id) {
        var appt = bookingService.getAppointmentById(id);
        if (appt.getClientEmail() == null || appt.getClientEmail().isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Customer has no email address"));
        }
        String dateTime = "N/A";
        if (appt.getScheduledAt() != null) {
            var vietZone = java.time.ZoneId.of("Asia/Ho_Chi_Minh");
            dateTime = java.time.ZonedDateTime.ofInstant(appt.getScheduledAt(), vietZone)
                .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        emailService.sendAppointmentConfirmation(
            appt.getClientEmail(),
            appt.getClientName(),
            dateTime,
            appt.getLawyerName() != null ? appt.getLawyerName() : "Van Phong Luat"
        );
        return ResponseEntity.ok(ApiResponse.success("Confirmation email queued for " + appt.getClientEmail()));
    }

    // === Booking Stats (Admin) ===

    @GetMapping("/admin/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get booking statistics for a date")
    public ResponseEntity<ApiResponse<com.lawfirm.brs.dto.response.BookingStatsDTO>> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        var stats = bookingStatsService.getStats(targetDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    public record UpdateStatusRequest(String status, String notes) {}
    public record RescheduleRequest(Instant newScheduledAt, Integer durationMinutes, String reason) {}
}

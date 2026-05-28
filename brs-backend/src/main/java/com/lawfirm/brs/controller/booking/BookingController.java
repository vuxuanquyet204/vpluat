package com.lawfirm.brs.controller.booking;

import com.lawfirm.brs.dto.request.BookingRequest;
import com.lawfirm.brs.dto.request.OtpVerifyRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.service.booking.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    public record UpdateStatusRequest(String status, String notes) {}
}

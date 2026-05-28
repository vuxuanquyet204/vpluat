package com.lawfirm.brs.controller.booking;

import com.lawfirm.brs.dto.request.AvailabilitySlotRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.AvailabilitySlotDTO;
import com.lawfirm.brs.service.booking.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Controller for availability management.
 */
@RestController
@RequestMapping("/api/bookings/availability")
@RequiredArgsConstructor
@Tag(name = "Availability", description = "Lawyer availability management")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/{lawyerId}")
    @Operation(summary = "Get available slots for a lawyer")
    public ResponseEntity<ApiResponse<List<AvailabilitySlotDTO>>> getAvailableSlots(
            @PathVariable UUID lawyerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<AvailabilitySlotDTO> slots = availabilityService.getAvailableSlots(lawyerId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Create availability slot")
    public ResponseEntity<ApiResponse<AvailabilitySlotDTO>> createSlot(
            @Valid @RequestBody AvailabilitySlotRequest request) {
        AvailabilitySlotDTO slot = availabilityService.createSlot(request);
        return ResponseEntity.ok(ApiResponse.success("Slot created successfully.", slot));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Delete availability slot")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable UUID id) {
        availabilityService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted successfully.", null));
    }
}

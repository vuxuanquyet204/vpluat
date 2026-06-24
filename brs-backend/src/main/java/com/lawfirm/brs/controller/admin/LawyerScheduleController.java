package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.LawyerScheduleDTO;
import com.lawfirm.brs.dto.response.LawyerScheduleOverrideDTO;
import com.lawfirm.brs.service.admin.LawyerScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin controller for managing lawyer schedules.
 */
@RestController
@RequestMapping("/api/admin/lawyers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
@Tag(name = "Admin - Lawyer Schedule", description = "Manage lawyer weekly schedules and overrides")
public class LawyerScheduleController {

    private final LawyerScheduleService scheduleService;

    @GetMapping("/{lawyerId}/schedule")
    @Operation(summary = "Get weekly schedule for a lawyer")
    public ResponseEntity<ApiResponse<List<LawyerScheduleDTO>>> getSchedule(
            @PathVariable UUID lawyerId) {
        List<LawyerScheduleDTO> schedule = scheduleService.getScheduleByLawyer(lawyerId);
        return ResponseEntity.ok(ApiResponse.success(schedule));
    }

    @PutMapping("/{lawyerId}/schedule")
    @Operation(summary = "Batch update weekly schedule for a lawyer")
    public ResponseEntity<ApiResponse<List<LawyerScheduleDTO>>> saveSchedule(
            @PathVariable UUID lawyerId,
            @RequestBody List<LawyerScheduleDTO.SlotUpdate> updates) {
        List<LawyerScheduleDTO> schedule = scheduleService.saveSchedule(lawyerId, updates);
        return ResponseEntity.ok(ApiResponse.success(schedule));
    }

    @GetMapping("/schedules")
    @Operation(summary = "Get schedules for all lawyers in a date range")
    public ResponseEntity<ApiResponse<Map<String, LawyerScheduleService.LawyerScheduleResponse>>> getAllSchedules(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Map<UUID, LawyerScheduleService.LawyerScheduleResponse> schedules = scheduleService.getAllSchedules(from, to);
        // Convert UUID keys to String for JSON compatibility
        Map<String, LawyerScheduleService.LawyerScheduleResponse> result = Map.ofEntries(
            schedules.entrySet().stream()
                .map(e -> Map.entry(e.getKey().toString(), e.getValue()))
                .toArray(Map.Entry[]::new)
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{lawyerId}/schedule/override")
    @Operation(summary = "Create a schedule override (vacation, special hours)")
    public ResponseEntity<ApiResponse<LawyerScheduleOverrideDTO>> createOverride(
            @PathVariable UUID lawyerId,
            @Valid @RequestBody ScheduleOverrideRequest request) {
        LawyerScheduleOverrideDTO override = scheduleService.createOverride(
            lawyerId, request.overrideDate(), request.type(),
            request.slots(), request.reason());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(override));
    }

    @DeleteMapping("/{lawyerId}/schedule/override")
    @Operation(summary = "Delete a schedule override")
    public ResponseEntity<ApiResponse<Void>> deleteOverride(
            @PathVariable UUID lawyerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        scheduleService.deleteOverride(lawyerId, date);
        return ResponseEntity.ok(ApiResponse.success("Override deleted.", null));
    }

    public record ScheduleOverrideRequest(
        LocalDate overrideDate,
        String type, // "off" | "custom"
        List<LawyerScheduleDTO.TimeSlot> slots,
        String reason
    ) {}
}

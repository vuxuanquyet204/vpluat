package com.lawfirm.brs.controller.crm;

import com.lawfirm.brs.dto.request.LeadRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.service.crm.LeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for lead management (CRM).
 */
@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
@Tag(name = "CRM - Leads", description = "Lead management endpoints")
public class LeadController {

    private final LeadService leadService;

    @PostMapping("/leads")
    @Operation(summary = "Create a new lead (public)")
    public ResponseEntity<ApiResponse<LeadDTO>> createLead(
            @Valid @RequestBody LeadRequest request,
            HttpServletRequest httpRequest) {
        if (request.ipAddress() == null) {
            request = new LeadRequest(
                request.name(), request.email(), request.phone(),
                request.serviceId(), request.message(), request.source(),
                request.channel(), request.campaignId(), request.adGroupId(),
                request.utmSource(), request.utmMedium(), request.utmCampaign(),
                getClientIp(httpRequest), request.userAgent()
            );
        }
        LeadDTO lead = leadService.createLead(request);
        return ResponseEntity.ok(ApiResponse.success("Lead created successfully", lead));
    }

    @GetMapping("/leads")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get all leads with pagination")
    public ResponseEntity<ApiResponse<PageResponse<LeadDTO>>> getAllLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source) {
        PageResponse<LeadDTO> leads = leadService.getAllLeads(page, size, status, source);
        return ResponseEntity.ok(ApiResponse.success(leads));
    }

    @GetMapping("/leads/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get lead by ID")
    public ResponseEntity<ApiResponse<LeadDTO>> getLeadById(@PathVariable UUID id) {
        LeadDTO lead = leadService.getLeadById(id);
        return ResponseEntity.ok(ApiResponse.success(lead));
    }

    @PatchMapping("/leads/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Update lead status")
    public ResponseEntity<ApiResponse<LeadDTO>> updateLeadStatus(
            @PathVariable UUID id,
            @RequestBody UpdateLeadRequest request) {
        LeadDTO lead = leadService.updateLeadStatus(id, request.status(), request.assignedTo(), request.notes());
        return ResponseEntity.ok(ApiResponse.success("Lead updated successfully", lead));
    }

    @PostMapping("/leads/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Add note to lead")
    public ResponseEntity<ApiResponse<LeadDTO>> addNote(
            @PathVariable UUID id,
            @RequestBody AddNoteRequest request) {
        LeadDTO lead = leadService.addNote(id, request.note(), null);
        return ResponseEntity.ok(ApiResponse.success("Note added successfully", lead));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    public record UpdateLeadRequest(String status, UUID assignedTo, String notes) {}
    public record AddNoteRequest(String note) {}
}

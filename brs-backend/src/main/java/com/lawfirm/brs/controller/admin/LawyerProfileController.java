package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.LawyerRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.service.admin.LawyerManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for lawyer profile management (admin).
 */
@RestController
@RequestMapping("/api/admin/lawyers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Lawyers", description = "Lawyer profile management endpoints")
public class LawyerProfileController {

    private final LawyerManagementService lawyerService;

    @PostMapping
    @Operation(summary = "Create a new lawyer profile")
    public ResponseEntity<ApiResponse<LawyerDTO>> createLawyer(
            @Valid @RequestBody LawyerRequest request) {
        LawyerDTO lawyer = lawyerService.createLawyer(request);
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile created successfully", lawyer));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lawyer profile")
    public ResponseEntity<ApiResponse<LawyerDTO>> updateLawyer(
            @PathVariable UUID id,
            @Valid @RequestBody LawyerRequest request) {
        LawyerDTO lawyer = lawyerService.updateLawyer(id, request);
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile updated successfully", lawyer));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lawyer profile by ID")
    public ResponseEntity<ApiResponse<LawyerDTO>> getLawyerById(@PathVariable UUID id) {
        LawyerDTO lawyer = lawyerService.getLawyerById(id);
        return ResponseEntity.ok(ApiResponse.success(lawyer));
    }

    @GetMapping
    @Operation(summary = "Get all lawyer profiles")
    public ResponseEntity<ApiResponse<List<LawyerDTO>>> getAllLawyers() {
        List<LawyerDTO> lawyers = lawyerService.getAllLawyers();
        return ResponseEntity.ok(ApiResponse.success(lawyers));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured lawyer profiles")
    public ResponseEntity<ApiResponse<List<LawyerDTO>>> getFeaturedLawyers() {
        List<LawyerDTO> lawyers = lawyerService.getFeaturedLawyers();
        return ResponseEntity.ok(ApiResponse.success(lawyers));
    }

    @PatchMapping("/{id}/feature")
    @Operation(summary = "Toggle lawyer featured status")
    public ResponseEntity<ApiResponse<LawyerDTO>> toggleFeature(@PathVariable UUID id) {
        LawyerDTO lawyer = lawyerService.toggleFeature(id);
        return ResponseEntity.ok(ApiResponse.success("Lawyer feature status toggled successfully", lawyer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lawyer profile")
    public ResponseEntity<ApiResponse<Void>> deleteLawyer(@PathVariable UUID id) {
        lawyerService.deleteLawyer(id);
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile deleted successfully", null));
    }
}

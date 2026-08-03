package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.LawyerPatchRequest;
import com.lawfirm.brs.dto.request.LawyerRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.service.admin.LawyerManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
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
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('EDITOR')")
@Tag(name = "Admin - Lawyers", description = "Lawyer profile management endpoints")
public class LawyerProfileController {

    private final LawyerManagementService lawyerService;

    @PostMapping
    @Operation(summary = "Create a new lawyer profile")
    @CacheEvict(value = "lawyers", allEntries = true)
    public ResponseEntity<ApiResponse<LawyerDTO>> createLawyer(
            @Valid @RequestBody LawyerRequest request) {
        log.info("Creating lawyer: {}", request.email());
        LawyerDTO lawyer = lawyerService.createLawyer(request);
        log.info("Lawyer created, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile created successfully", lawyer));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a lawyer profile (full update)")
    @CacheEvict(value = "lawyers", allEntries = true)
    public ResponseEntity<ApiResponse<LawyerDTO>> updateLawyer(
            @PathVariable UUID id,
            @Valid @RequestBody LawyerRequest request) {
        log.info("Updating lawyer: {}", id);
        LawyerDTO lawyer = lawyerService.updateLawyer(id, request);
        log.info("Lawyer updated, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile updated successfully", lawyer));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Partial update lawyer profile (only send fields you want to change)")
    @CacheEvict(value = "lawyers", allEntries = true)
    public ResponseEntity<ApiResponse<LawyerDTO>> patchLawyer(
            @PathVariable UUID id,
            @Valid @RequestBody LawyerPatchRequest request) {
        log.info("Patching lawyer: {}", id);
        LawyerDTO lawyer = lawyerService.patchLawyer(id, request);
        log.info("Lawyer patched, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile patched successfully", lawyer));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lawyer profile by ID")
    public ResponseEntity<ApiResponse<LawyerDTO>> getLawyerById(@PathVariable UUID id) {
        LawyerDTO lawyer = lawyerService.getLawyerById(id);
        return ResponseEntity.ok(ApiResponse.success(lawyer));
    }

    @GetMapping
    @Operation(summary = "Get lawyer profiles with optional search/filter (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<LawyerDTO>>> getAllLawyers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String positionVi,
            @RequestParam(required = false) UUID serviceId
    ) {
        PageResponse<LawyerDTO> lawyers = lawyerService.searchLawyers(page, size, search, isActive, positionVi, serviceId);
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
    @CacheEvict(value = "lawyers", allEntries = true)
    public ResponseEntity<ApiResponse<LawyerDTO>> toggleFeature(@PathVariable UUID id) {
        log.info("Toggling feature for lawyer: {}", id);
        LawyerDTO lawyer = lawyerService.toggleFeature(id);
        log.info("Lawyer feature toggled, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Lawyer feature status toggled successfully", lawyer));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a lawyer profile")
    @CacheEvict(value = "lawyers", allEntries = true)
    public ResponseEntity<ApiResponse<Void>> deleteLawyer(@PathVariable UUID id) {
        log.info("Deleting lawyer: {}", id);
        lawyerService.deleteLawyer(id);
        log.info("Lawyer deleted, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Lawyer profile deleted successfully", null));
    }
}

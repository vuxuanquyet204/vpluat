package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.ServiceRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.service.admin.ServiceManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for service management (admin).
 */
@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@Tag(name = "Admin - Services", description = "Service management endpoints")
public class ServiceController {

    private final ServiceManagementService serviceService;

    @GetMapping
    @Operation(summary = "Get services with optional search/filter (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<ServiceDTO>>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        PageResponse<ServiceDTO> services = serviceService.searchServices(
                page, size, search, isActive, category, dateFrom, dateTo);
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID (Admin)")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceById(@PathVariable UUID id) {
        ServiceDTO service = serviceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @PostMapping
    @Operation(summary = "Create a new service (Admin)")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(
            @Valid @RequestBody ServiceRequest request) {
        log.info("Creating service: {}", request.slug());
        ServiceDTO service = serviceService.createService(request);
        log.info("Service created, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Service created successfully", service));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a service (Admin)")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceRequest request) {
        log.info("Updating service: {}", id);
        ServiceDTO service = serviceService.updateService(id, request);
        log.info("Service updated, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", service));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a service (Admin)")
    @CacheEvict(value = "services", allEntries = true)
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable UUID id) {
        log.info("Deleting service: {}", id);
        serviceService.deleteService(id);
        log.info("Service deleted, cache evicted");
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }
}

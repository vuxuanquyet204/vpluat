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
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@Tag(name = "Admin - Services", description = "Service management endpoints")
public class ServiceController {

    private final ServiceManagementService serviceService;

    @GetMapping
    @Operation(summary = "Get all services with pagination (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<ServiceDTO>>> getAllServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<ServiceDTO> services = serviceService.getAllServices(page, size);
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
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(
            @Valid @RequestBody ServiceRequest request) {
        ServiceDTO service = serviceService.createService(request);
        return ResponseEntity.ok(ApiResponse.success("Service created successfully", service));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a service (Admin)")
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceRequest request) {
        ServiceDTO service = serviceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", service));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a service (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable UUID id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }
}

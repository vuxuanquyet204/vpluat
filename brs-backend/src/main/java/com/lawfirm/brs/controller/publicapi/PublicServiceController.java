package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.service.publicapi.ServiceEntityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public controller for services.
 */
@RestController
@RequestMapping("/api/public/services")
@RequiredArgsConstructor
@Tag(name = "Public - Services", description = "Public endpoints for legal services")
public class PublicServiceController {

    private final ServiceEntityService serviceService;

    @GetMapping
    @Operation(summary = "Get all active services")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getAllServices() {
        List<ServiceDTO> services = serviceService.getActiveServices();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured services")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getFeaturedServices() {
        List<ServiceDTO> services = serviceService.getFeaturedServices();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get service by slug")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceBySlug(@PathVariable String slug) {
        ServiceDTO service = serviceService.getServiceBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(service));
    }
}

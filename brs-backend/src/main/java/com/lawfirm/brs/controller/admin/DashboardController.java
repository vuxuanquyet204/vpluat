package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.DashboardStatsDTO;
import com.lawfirm.brs.service.admin.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for admin dashboard.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Dashboard", description = "Dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics (legacy fields only)")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        DashboardStatsDTO stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/stats/range")
    @Operation(summary = "Get dashboard statistics for a given range")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStatsRange(
        @RequestParam(defaultValue = "week") String range
    ) {
        DashboardStatsDTO stats = dashboardService.getStatsRange(range);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

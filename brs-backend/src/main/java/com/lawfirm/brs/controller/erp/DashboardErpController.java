package com.lawfirm.brs.controller.erp;

import com.lawfirm.brs.dto.response.*;
import com.lawfirm.brs.service.erp.DashboardErpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Admin dashboard extension: charts, activity feed, CSV export.
 * Sits alongside {@link com.lawfirm.brs.controller.admin.DashboardController}.
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Tag(name = "Admin - Dashboard ERP", description = "Charts, activity, exports")
public class DashboardErpController {

    private final DashboardErpService service;

    @GetMapping("/charts/visitors")
    @Operation(summary = "Visitor / lead time-series for the last N days")
    public ResponseEntity<ApiResponse<List<TimeSeriesPoint>>> visitors(
        @RequestParam(defaultValue = "30") int days
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.visitorSeries(Math.min(Math.max(days, 1), 90))));
    }

    @GetMapping("/charts/service-distribution")
    @Operation(summary = "Lead distribution grouped by service")
    public ResponseEntity<ApiResponse<List<DistributionSlice>>> serviceDistribution(
        @RequestParam(defaultValue = "week") String range
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.serviceDistribution(range)));
    }

    @GetMapping("/charts/lead-funnel")
    @Operation(summary = "Lead conversion funnel")
    public ResponseEntity<ApiResponse<LeadFunnelResponse>> leadFunnel(
        @RequestParam(defaultValue = "week") String range
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.leadFunnel(range)));
    }

    @GetMapping("/charts/revenue")
    @Operation(summary = "Revenue / booking time-series")
    public ResponseEntity<ApiResponse<List<TimeSeriesPoint>>> revenue(
        @RequestParam(defaultValue = "month") String range
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.revenueSeries(range)));
    }

    @GetMapping("/activity")
    @Operation(summary = "Recent admin activity feed")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> activity(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.recentActivity(limit)));
    }

    @GetMapping("/appointments/today")
    @Operation(summary = "List today's appointments with details")
    public ResponseEntity<ApiResponse<List<AppointmentSummaryResponse>>> todayAppointments() {
        return ResponseEntity.ok(ApiResponse.success(service.todayAppointments()));
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export dashboard KPIs as CSV")
    public ResponseEntity<byte[]> exportCsv(
        @RequestParam(defaultValue = "month") String range
    ) {
        String csv = service.exportCsv(range);
        byte[] body = csv.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        headers.setContentDispositionFormData("attachment", "dashboard-" + range + ".csv");
        return ResponseEntity.ok().headers(headers).body(body);
    }
}

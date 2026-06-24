package com.lawfirm.brs.controller.erp;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.DistributionSlice;
import com.lawfirm.brs.dto.response.TimeSeriesPoint;
import com.lawfirm.brs.service.erp.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin reports: revenue, conversion, lawyer performance, service trends.
 */
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Tag(name = "Admin - Reports", description = "Aggregated business reports")
public class ReportsController {

    private final ReportExportService service;

    @GetMapping("/revenue")
    @Operation(summary = "Revenue report bucketed by day/week/month")
    public ResponseEntity<ApiResponse<List<TimeSeriesPoint>>> revenue(
            @RequestParam(defaultValue = "week") String range,
            @RequestParam(defaultValue = "day") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(service.revenue(range, groupBy)));
    }

    @GetMapping("/conversion")
    @Operation(summary = "Lead conversion funnel report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> conversion(
            @RequestParam(defaultValue = "month") String range) {
        return ResponseEntity.ok(ApiResponse.success(service.conversionFunnel(range)));
    }

    @GetMapping("/lawyer-performance")
    @Operation(summary = "Performance metrics per lawyer")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> lawyerPerformance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant f = from == null ? Instant.EPOCH : from.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        Instant t = to == null ? Instant.now() : to.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
        return ResponseEntity.ok(ApiResponse.success(service.lawyerPerformance(f, t)));
    }

    @GetMapping("/service-trends")
    @Operation(summary = "Service demand trends")
    public ResponseEntity<ApiResponse<List<DistributionSlice>>> serviceTrends(
            @RequestParam(defaultValue = "month") String range) {
        return ResponseEntity.ok(ApiResponse.success(service.serviceTrends(range)));
    }

    @GetMapping("/export/{reportType}")
    @Operation(summary = "Export a report as CSV (reportType: revenue|conversion|lawyer|service)")
    public ResponseEntity<byte[]> export(
            @PathVariable String reportType,
            @RequestParam(defaultValue = "month") String range) {
        String csv = service.export(reportType, range);
        byte[] body = csv.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        headers.setContentDispositionFormData("attachment", reportType + "-" + range + ".csv");
        return ResponseEntity.ok().headers(headers).body(body);
    }
}

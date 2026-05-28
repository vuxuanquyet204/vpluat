package com.lawfirm.brs.controller.crm;

import com.lawfirm.brs.dto.request.JobApplicationRequest;
import com.lawfirm.brs.dto.request.JobPostingRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.JobApplicationDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.service.admin.JobManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for job posting and application management.
 */
@RestController
@RequestMapping("/api/crm/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job posting and application endpoints")
public class JobController {

    private final JobManagementService jobService;

    // ==================== Public Endpoints ====================

    @GetMapping
    @Operation(summary = "Get all published job postings (public)")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getPublishedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PostDTO> jobs = jobService.getPublishedJobs(page, size);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job posting by ID (public)")
    public ResponseEntity<ApiResponse<PostDTO>> getJobById(@PathVariable UUID id) {
        PostDTO job = jobService.getJobById(id);
        return ResponseEntity.ok(ApiResponse.success(job));
    }

    @PostMapping("/{id}/apply")
    @Operation(summary = "Apply for a job (public)")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> applyForJob(
            @PathVariable UUID id,
            @Valid JobApplicationRequest request) {
        JobApplicationDTO application = jobService.applyForJob(id, request);
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully", application));
    }

    // ==================== Admin Endpoints ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @Operation(summary = "Create a new job posting (Admin)")
    public ResponseEntity<ApiResponse<PostDTO>> createJob(
            @Valid @RequestBody JobPostingRequest request) {
        PostDTO job = jobService.createJob(request);
        return ResponseEntity.ok(ApiResponse.success("Job posting created successfully", job));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @Operation(summary = "Update a job posting (Admin)")
    public ResponseEntity<ApiResponse<PostDTO>> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobPostingRequest request) {
        PostDTO job = jobService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.success("Job posting updated successfully", job));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @Operation(summary = "Publish a job posting (Admin)")
    public ResponseEntity<ApiResponse<PostDTO>> publishJob(@PathVariable UUID id) {
        PostDTO job = jobService.publishJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting published successfully", job));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @Operation(summary = "Close a job posting (Admin)")
    public ResponseEntity<ApiResponse<PostDTO>> closeJob(@PathVariable UUID id) {
        PostDTO job = jobService.closeJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting closed successfully", job));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a job posting (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.success("Job posting deleted successfully", null));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
    @Operation(summary = "Get all job postings including drafts (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        PageResponse<PostDTO> jobs = jobService.getAllJobs(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(jobs));
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get all job applications (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<JobApplicationDTO>>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID jobId,
            @RequestParam(required = false) String status) {
        PageResponse<JobApplicationDTO> applications = jobService.getAllApplications(page, size, jobId, status);
        return ResponseEntity.ok(ApiResponse.success(applications));
    }

    @GetMapping("/applications/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Get job application by ID (Admin)")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> getApplicationById(@PathVariable UUID id) {
        JobApplicationDTO application = jobService.getApplicationById(id);
        return ResponseEntity.ok(ApiResponse.success(application));
    }

    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
    @Operation(summary = "Update application status (Admin)")
    public ResponseEntity<ApiResponse<JobApplicationDTO>> updateApplicationStatus(
            @PathVariable UUID id,
            @RequestBody UpdateApplicationStatusRequest request) {
        JobApplicationDTO application = jobService.updateApplicationStatus(id, request.status());
        return ResponseEntity.ok(ApiResponse.success("Application status updated successfully", application));
    }

    public record UpdateApplicationStatusRequest(String status) {}
}

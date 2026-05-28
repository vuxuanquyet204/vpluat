package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.CaseStudyRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.service.content.CaseStudyService;
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
 * Controller for case study management (admin).
 */
@RestController
@RequestMapping("/api/admin/case-studies")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@Tag(name = "Admin - Case Studies", description = "Case study management endpoints")
public class CaseStudyController {

    private final CaseStudyService caseStudyService;

    @PostMapping
    @Operation(summary = "Create a new case study")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> createCaseStudy(
            @Valid @RequestBody CaseStudyRequest request,
            @RequestAttribute("userId") UUID authorId) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.createCaseStudy(request, authorId);
        return ResponseEntity.ok(ApiResponse.success("Case study created successfully", caseStudy));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a case study")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> updateCaseStudy(
            @PathVariable UUID id,
            @Valid @RequestBody CaseStudyRequest request) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.updateCaseStudy(id, request);
        return ResponseEntity.ok(ApiResponse.success("Case study updated successfully", caseStudy));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get case study by ID")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> getCaseStudy(@PathVariable UUID id) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.getCaseStudy(id);
        return ResponseEntity.ok(ApiResponse.success(caseStudy));
    }

    @GetMapping
    @Operation(summary = "Get all case studies")
    public ResponseEntity<ApiResponse<List<CaseStudyService.CaseStudy>>> getAllCaseStudies(
            @RequestParam(defaultValue = "false") boolean publishedOnly) {
        List<CaseStudyService.CaseStudy> caseStudies = caseStudyService.listCaseStudies(publishedOnly);
        return ResponseEntity.ok(ApiResponse.success(caseStudies));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish a case study")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> publishCaseStudy(@PathVariable UUID id) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.publishCaseStudy(id);
        return ResponseEntity.ok(ApiResponse.success("Case study published successfully", caseStudy));
    }

    @PatchMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish a case study")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> unpublishCaseStudy(@PathVariable UUID id) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.unpublishCaseStudy(id);
        return ResponseEntity.ok(ApiResponse.success("Case study unpublished successfully", caseStudy));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a case study")
    public ResponseEntity<ApiResponse<Void>> deleteCaseStudy(@PathVariable UUID id) {
        caseStudyService.deleteCaseStudy(id);
        return ResponseEntity.ok(ApiResponse.success("Case study deleted successfully", null));
    }
}

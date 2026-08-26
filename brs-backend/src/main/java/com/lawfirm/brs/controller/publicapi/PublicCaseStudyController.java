package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.service.content.CaseStudyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/case-studies")
@RequiredArgsConstructor
@Tag(name = "Public - Case Studies", description = "Published case study content")
public class PublicCaseStudyController {

    private final CaseStudyService caseStudyService;

    @GetMapping
    @Operation(summary = "List published case studies")
    public ResponseEntity<ApiResponse<List<CaseStudyService.CaseStudy>>> list(
            @RequestParam(required = false) UUID serviceId) {
        List<CaseStudyService.CaseStudy> caseStudies = serviceId == null
                ? caseStudyService.listCaseStudies(true)
                : caseStudyService.listCaseStudiesByService(serviceId, true);
        return ResponseEntity.ok(ApiResponse.success(caseStudies));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a published case study by slug")
    public ResponseEntity<ApiResponse<CaseStudyService.CaseStudy>> getBySlug(
            @PathVariable String slug) {
        CaseStudyService.CaseStudy caseStudy = caseStudyService.getCaseStudyBySlug(slug);
        if (!caseStudy.isPublished()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(caseStudy));
    }
}

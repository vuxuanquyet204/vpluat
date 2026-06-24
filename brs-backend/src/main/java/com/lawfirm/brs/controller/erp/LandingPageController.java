package com.lawfirm.brs.controller.erp;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.LandingPage;
import com.lawfirm.brs.service.erp.LandingPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/landing-pages")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@Tag(name = "Admin - Landing Pages", description = "Landing page management")
public class LandingPageController {
    private final LandingPageService service;

    @GetMapping
    @Operation(summary = "List all landing pages")
    public ResponseEntity<ApiResponse<PageResponse<LandingPage>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.list(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get landing page by ID")
    public ResponseEntity<ApiResponse<LandingPage>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }

    @GetMapping("/{id}/stats")
    @Operation(summary = "Get landing page analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.stats(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new landing page")
    public ResponseEntity<ApiResponse<LandingPage>> create(@RequestBody CreateRequest body) {
        LandingPage lp = service.create(body.titleVi(), body.titleEn(), body.slug(), body.content());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Landing page created", lp));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update landing page")
    public ResponseEntity<ApiResponse<LandingPage>> update(
            @PathVariable UUID id,
            @RequestBody UpdateRequest body) {
        LandingPage lp = service.update(id, body.titleVi(), body.titleEn(), body.content(), body.isPublished());
        return ResponseEntity.ok(ApiResponse.success("Landing page updated", lp));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a landing page")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateRequest(String titleVi, String titleEn, String slug, String content) {}
    public record UpdateRequest(String titleVi, String titleEn, String content, Boolean isPublished) {}
}
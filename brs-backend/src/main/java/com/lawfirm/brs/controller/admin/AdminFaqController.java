package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.FaqRequest;
import com.lawfirm.brs.dto.response.AdminFaqDTO;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.security.UserPrincipal;
import com.lawfirm.brs.service.admin.AdminFaqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin endpoints for FAQ management and chatbot suggestion configuration.
 *
 * <p>Endpoints are colocated with chatbot config so admins can manage them
 * in the same tab (admin Chat Log / FAQ).
 */
@RestController
@RequestMapping("/api/admin/faqs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin - FAQs", description = "FAQ CRUD and chatbot suggestion configuration")
public class AdminFaqController {

    private final AdminFaqService adminFaqService;

    @GetMapping
    @Operation(summary = "List FAQs (admin)")
    public ResponseEntity<ApiResponse<PageResponse<AdminFaqDTO>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean isPublished,
            @RequestParam(required = false) String search) {
        Page<AdminFaqDTO> result = adminFaqService.list(page, size, isPublished, search);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FAQ detail")
    public ResponseEntity<ApiResponse<AdminFaqDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminFaqService.get(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new FAQ")
    public ResponseEntity<ApiResponse<AdminFaqDTO>> create(@Valid @RequestBody FaqRequest request,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        UUID actor = principal == null ? null : principal.getId();
        AdminFaqDTO dto = adminFaqService.create(request, actor);
        return ResponseEntity.ok(ApiResponse.success("FAQ created", dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing FAQ")
    public ResponseEntity<ApiResponse<AdminFaqDTO>> update(@PathVariable UUID id,
                                                           @Valid @RequestBody FaqRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        UUID actor = principal == null ? null : principal.getId();
        AdminFaqDTO dto = adminFaqService.update(id, request, actor);
        return ResponseEntity.ok(ApiResponse.success("FAQ updated", dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a FAQ")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        UUID actor = principal == null ? null : principal.getId();
        adminFaqService.delete(id, actor);
        return ResponseEntity.ok(ApiResponse.success("FAQ deleted", null));
    }

    @PostMapping("/{id}/toggle-suggestion")
    @Operation(summary = "Toggle the chatbot-suggestion kill-switch for a FAQ")
    public ResponseEntity<ApiResponse<AdminFaqDTO>> toggleSuggestion(@PathVariable UUID id,
                                                                     @AuthenticationPrincipal UserPrincipal principal) {
        UUID actor = principal == null ? null : principal.getId();
        return ResponseEntity.ok(ApiResponse.success(adminFaqService.toggleSuggestion(id, actor)));
    }
}
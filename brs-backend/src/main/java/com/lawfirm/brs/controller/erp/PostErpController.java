package com.lawfirm.brs.controller.erp;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.service.erp.PostErpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Post admin extensions: revisions and duplicate-as-draft.
 * Note: GET /{id}/revisions lives in PostController to avoid ambiguous
 * mapping. This controller only holds snapshot and duplicate.
 */
@RestController
@RequestMapping("/api/admin/posts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('EDITOR')")
@Tag(name = "Admin - Posts ERP", description = "Revisions and post utilities")
public class PostErpController {

    private final PostErpService service;

    /** Manual snapshot — prefer the auto-snapshot that PostManagementService
     *  calls on create/update/publish. This is for admin-triggered snapshots. */
    @PostMapping("/{id}/snapshot")
    @Operation(summary = "Manually snapshot the post into a new revision")
    public ResponseEntity<ApiResponse<Object>> snapshot(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID editorId,
            @RequestParam(required = false) String note) {
        service.snapshot(id, editorId, note);
        return ResponseEntity.ok(ApiResponse.success("Snapshot created", null));
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Clone a post as a new draft")
    public ResponseEntity<ApiResponse<PostDTO>> duplicate(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID editorId) {
        return ResponseEntity.ok(ApiResponse.success(service.duplicate(id, editorId)));
    }
}

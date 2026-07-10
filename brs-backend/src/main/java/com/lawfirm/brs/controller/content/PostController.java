package com.lawfirm.brs.controller.content;

import com.lawfirm.brs.dto.request.PostRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PostRevisionDTO;
import com.lawfirm.brs.service.content.PostManagementService;
import com.lawfirm.brs.service.erp.PostErpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Controller for post management (admin).
 */
@RestController
@RequestMapping("/api/admin/posts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('EDITOR')")
@Tag(name = "Admin - Posts", description = "Post management endpoints")
public class PostController {

    private final PostManagementService postService;
    private final PostErpService postErpService;

    @PostMapping
    @Operation(summary = "Create a new post")
    public ResponseEntity<ApiResponse<PostDTO>> createPost(
            @Valid @RequestBody PostRequest request,
            @RequestAttribute("userId") UUID authorId) {
        PostDTO post = postService.createPost(request, authorId);
        return ResponseEntity.ok(ApiResponse.success("Post created successfully", post));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<ApiResponse<PostDTO>> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody PostRequest request) {
        PostDTO post = postService.updatePost(id, request);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", post));
    }

    @PatchMapping("/{id}/publish")
    @Operation(summary = "Publish a post")
    public ResponseEntity<ApiResponse<PostDTO>> publishPost(@PathVariable UUID id) {
        PostDTO post = postService.publishPost(id);
        return ResponseEntity.ok(ApiResponse.success("Post published successfully", post));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a post")
    public ResponseEntity<ApiResponse<PostDTO>> archivePost(@PathVariable UUID id) {
        PostDTO post = postService.archivePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post archived successfully", post));
    }

    @PatchMapping("/{id}/schedule")
    @Operation(summary = "Schedule a post for future publication")
    public ResponseEntity<ApiResponse<PostDTO>> schedulePost(
            @PathVariable UUID id,
            @RequestParam("at") String at) {
        Instant when = Instant.parse(at);
        PostDTO post = postService.schedulePost(id, when);
        return ResponseEntity.ok(ApiResponse.success("Post scheduled", post));
    }

    /** Delegates to PostErpService for revisions and snapshot management. */
    @PostMapping("/{id}/revisions")
    @Operation(summary = "Record a revision snapshot of the post")
    public ResponseEntity<ApiResponse<PostDTO>> recordRevision(
            @PathVariable UUID id,
            @RequestParam(required = false) String note,
            @RequestAttribute(value = "userId", required = false) UUID editorId) {
        postErpService.snapshot(id, editorId, note);
        return ResponseEntity.ok(ApiResponse.success("Revision recorded", null));
    }

    @GetMapping("/{id}/revisions")
    @Operation(summary = "List revision history for a post")
    public ResponseEntity<ApiResponse<PageResponse<PostRevisionDTO>>> listRevisions(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            postErpService.revisions(id, page, size)));
    }

    @PostMapping("/{id}/revisions/{revisionId}/restore")
    @Operation(summary = "Restore the post to the state captured by the given revision")
    public ResponseEntity<ApiResponse<Void>> restoreRevision(
            @PathVariable UUID id,
            @PathVariable UUID revisionId) {
        postErpService.restoreRevision(id, revisionId);
        return ResponseEntity.ok(ApiResponse.success("Post restored", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete a post")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post by ID")
    public ResponseEntity<ApiResponse<PostDTO>> getPost(@PathVariable UUID id) {
        PostDTO post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @GetMapping
    @Operation(summary = "Get all posts")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        PageResponse<PostDTO> posts = postService.getAllPosts(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/export")
    @Operation(summary = "Export posts to CSV")
    public ResponseEntity<String> exportPosts() {
        String csv = postErpService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"posts.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

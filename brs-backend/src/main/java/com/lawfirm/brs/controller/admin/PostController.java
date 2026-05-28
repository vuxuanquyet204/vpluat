package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.PostRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.service.content.PostManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for post management (admin).
 */
@RestController
@RequestMapping("/api/admin/posts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@Tag(name = "Admin - Posts", description = "Post management endpoints")
public class PostController {

    private final PostManagementService postService;

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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
}

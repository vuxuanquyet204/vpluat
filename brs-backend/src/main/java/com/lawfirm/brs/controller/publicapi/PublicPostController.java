package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.service.publicapi.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public controller for posts.
 */
@RestController
@RequestMapping("/api/public/posts")
@RequiredArgsConstructor
@Tag(name = "Public - Posts", description = "Public endpoints for blog posts")
public class PublicPostController {

    private final PostService postService;

    @GetMapping
    @Operation(summary = "Get published posts with pagination")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PostDTO> posts = postService.getPublishedPosts(page, size);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured posts")
    public ResponseEntity<ApiResponse<List<PostDTO>>> getFeaturedPosts() {
        List<PostDTO> posts = postService.getFeaturedPosts();
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get post by slug")
    public ResponseEntity<ApiResponse<PostDTO>> getPostBySlug(@PathVariable String slug) {
        PostDTO post = postService.getPostBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(post));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get posts by category")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getPostsByCategory(
            @PathVariable UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PostDTO> posts = postService.getPostsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/tag/{tagSlug}")
    @Operation(summary = "Get posts by tag")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getPostsByTag(
            @PathVariable String tagSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<PostDTO> posts = postService.getPostsByTag(tagSlug, page, size);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/{postId}/related")
    @Operation(summary = "Get related posts")
    public ResponseEntity<ApiResponse<List<PostDTO>>> getRelatedPosts(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "5") int limit) {
        List<PostDTO> posts = postService.getRelatedPosts(postId, limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @PostMapping("/{postId}/view")
    @Operation(summary = "Increment post view count")
    public ResponseEntity<ApiResponse<Void>> incrementViews(@PathVariable UUID postId) {
        postService.incrementViews(postId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

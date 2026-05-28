package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.service.publicapi.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for review management (admin).
 */
@RestController
@RequestMapping("/api/crm/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'CSKH')")
@Tag(name = "Admin - Reviews", description = "Review management endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all reviews with pagination")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDTO>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<ReviewDTO> allReviews = reviewService.getAllReviews();
        // Simple pagination - in production, add proper pagination to service
        int start = page * size;
        int end = Math.min(start + size, allReviews.size());
        List<ReviewDTO> paged = start < allReviews.size() ? allReviews.subList(start, end) : List.of();
        
        return ResponseEntity.ok(ApiResponse.success(PageResponse.<ReviewDTO>builder()
                .content(paged)
                .page(page)
                .size(size)
                .totalElements(allReviews.size())
                .totalPages((int) Math.ceil((double) allReviews.size() / size))
                .build()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ApiResponse<ReviewDTO>> getReviewById(@PathVariable UUID id) {
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(review));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish/approve a review")
    public ResponseEntity<ApiResponse<ReviewDTO>> publishReview(@PathVariable UUID id) {
        ReviewDTO review = reviewService.publishReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review published successfully", review));
    }

    @PostMapping("/{id}/feature")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Feature/unfeature a review")
    public ResponseEntity<ApiResponse<ReviewDTO>> toggleFeatureReview(@PathVariable UUID id) {
        ReviewDTO review = reviewService.toggleFeature(id);
        return ResponseEntity.ok(ApiResponse.success("Review feature toggled successfully", review));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}

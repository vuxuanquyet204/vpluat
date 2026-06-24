package com.lawfirm.brs.controller.content;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.service.erp.ReviewModerationService;
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
@PreAuthorize("hasAnyRole('ADMIN', 'CSKH', 'MANAGER')")
@Tag(name = "Admin - Reviews", description = "Review management endpoints")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewModerationService moderation;

    @GetMapping
    @Operation(summary = "List reviews with status / rating / date filters")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDTO>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) UUID lawyerId) {
        return ResponseEntity.ok(ApiResponse.success(
            moderation.list(page, size, status, rating, lawyerId)));
    }

    @GetMapping("/pending")
    @Operation(summary = "List reviews awaiting moderation")
    public ResponseEntity<ApiResponse<PageResponse<ReviewDTO>>> pending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            moderation.list(page, size, "PENDING", null, null)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ApiResponse<ReviewDTO>> getReviewById(@PathVariable UUID id) {
        ReviewDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(review));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Approve a review (PENDING -> APPROVED)")
    public ResponseEntity<ApiResponse<ReviewDTO>> publishReview(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID moderatorId) {
        ReviewDTO review = moderation.approve(id, moderatorId);
        return ResponseEntity.ok(ApiResponse.success("Review published", review));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Reject a review with a reason")
    public ResponseEntity<ApiResponse<ReviewDTO>> rejectReview(
            @PathVariable UUID id,
            @RequestBody RejectRequest body) {
        ReviewDTO review = moderation.reject(id, body.reason(), body.moderatorId());
        return ResponseEntity.ok(ApiResponse.success("Review rejected", review));
    }

    @PostMapping("/{id}/feature")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle featured status")
    public ResponseEntity<ApiResponse<ReviewDTO>> toggleFeatureReview(@PathVariable UUID id) {
        ReviewDTO review = reviewService.toggleFeature(id);
        return ResponseEntity.ok(ApiResponse.success("Review feature toggled", review));
    }

    @PostMapping("/bulk/moderate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Bulk approve/reject a list of reviews")
    public ResponseEntity<ApiResponse<BulkResultResponse>> bulkModerate(
            @RequestBody BulkModerateRequest body) {
        return ResponseEntity.ok(ApiResponse.success(
            moderation.bulkModerate(body.ids(), body.action(), body.reason(), body.moderatorId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Hard-delete a review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }

    public record RejectRequest(String reason, UUID moderatorId) {}
    public record BulkModerateRequest(List<UUID> ids, String action, String reason, UUID moderatorId) {}
    public record BulkResultResponse(int succeeded, int failed, List<UUID> failedIds) {}
}

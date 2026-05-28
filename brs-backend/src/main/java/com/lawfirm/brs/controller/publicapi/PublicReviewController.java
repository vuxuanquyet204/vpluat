package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.service.publicapi.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public controller for reviews.
 */
@RestController
@RequestMapping("/api/public/reviews")
@RequiredArgsConstructor
@Tag(name = "Public - Reviews", description = "Public endpoints for client reviews")
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all published reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getPublishedReviews() {
        List<ReviewDTO> reviews = reviewService.getPublishedReviews();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getFeaturedReviews() {
        List<ReviewDTO> reviews = reviewService.getFeaturedReviews();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/lawyer/{lawyerId}")
    @Operation(summary = "Get reviews by lawyer")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getReviewsByLawyer(@PathVariable UUID lawyerId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByLawyer(lawyerId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get reviews by service")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getReviewsByService(@PathVariable UUID serviceId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByService(serviceId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent reviews")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getRecentReviews(
            @RequestParam(defaultValue = "10") int limit) {
        List<ReviewDTO> reviews = reviewService.getRecentReviews(limit);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
}

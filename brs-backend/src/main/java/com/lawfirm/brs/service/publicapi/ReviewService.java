package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.entity.Review;
import com.lawfirm.brs.mapper.ReviewMapper;
import com.lawfirm.brs.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing reviews (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    /**
     * Get all reviews with pagination (admin)
     */
    public List<ReviewDTO> getAllReviews() {
        log.debug("Fetching all reviews for admin");
        return reviewMapper.toDTOList(reviewRepository.findAll());
    }

    /**
     * Get review by ID
     */
    public ReviewDTO getReviewById(UUID id) {
        log.debug("Fetching review by id: {}", id);
        return reviewRepository.findById(id)
                .map(reviewMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
    }

    /**
     * Publish a review (approve)
     */
    @Transactional
    public ReviewDTO publishReview(UUID id) {
        log.debug("Publishing review: {}", id);
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        review.approve(null);
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    /**
     * Toggle feature status
     */
    @Transactional
    public ReviewDTO toggleFeature(UUID id) {
        log.debug("Toggling feature for review: {}", id);
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found: " + id));
        if (Boolean.TRUE.equals(review.getIsFeatured())) {
            review.setIsFeatured(false);
        } else {
            review.feature();
        }
        return reviewMapper.toDTO(reviewRepository.save(review));
    }

    /**
     * Delete a review
     */
    @Transactional
    public void deleteReview(UUID id) {
        log.debug("Deleting review: {}", id);
        reviewRepository.deleteById(id);
    }

    @Cacheable(value = "reviews", key = "'published'")
    public List<ReviewDTO> getPublishedReviews() {
        log.debug("Fetching all published reviews");
        return reviewMapper.toDTOList(reviewRepository.findByIsPublishedTrue());
    }

    @Cacheable(value = "reviews", key = "'featured'")
    public List<ReviewDTO> getFeaturedReviews() {
        log.debug("Fetching featured reviews");
        return reviewMapper.toDTOList(reviewRepository.findByIsFeaturedTrueAndIsPublishedTrue());
    }

    public List<ReviewDTO> getReviewsByLawyer(UUID lawyerId) {
        log.debug("Fetching reviews by lawyer: {}", lawyerId);
        return reviewMapper.toDTOList(reviewRepository.findByLawyerIdAndIsPublishedTrue(lawyerId));
    }

    public List<ReviewDTO> getReviewsByService(UUID serviceId) {
        log.debug("Fetching reviews by service: {}", serviceId);
        return reviewMapper.toDTOList(reviewRepository.findByServiceIdAndIsPublishedTrue(serviceId));
    }

    public List<ReviewDTO> getRecentReviews(int limit) {
        log.debug("Fetching {} recent reviews", limit);
        Pageable pageable = PageRequest.of(0, limit);
        return reviewMapper.toDTOList(reviewRepository.findRecentPublishedReviews(pageable));
    }
}

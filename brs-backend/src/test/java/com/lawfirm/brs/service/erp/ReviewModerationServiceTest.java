package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.ReviewStatus;
import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.entity.Review;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.ReviewMapper;
import com.lawfirm.brs.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewModerationServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private ReviewMapper reviewMapper;

    private ReviewModerationService service;

    @BeforeEach
    void setUp() {
        service = new ReviewModerationService(reviewRepository, reviewMapper);
    }

    @Test
    @DisplayName("approve transitions review to APPROVED and sets moderator")
    void approve() {
        UUID reviewer = UUID.randomUUID();
        Review r = Review.builder()
            .status(ReviewStatus.PENDING)
            .isPublished(false)
            .build();
        when(reviewRepository.findById(any())).thenReturn(Optional.of(r));
        when(reviewRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reviewMapper.toDTO(any())).thenReturn(new ReviewDTO());

        var result = service.approve(UUID.randomUUID(), reviewer);

        assertThat(r.getStatus()).isEqualTo(ReviewStatus.APPROVED);
        assertThat(r.getIsPublished()).isTrue();
        assertThat(r.getModeratedBy()).isNotNull();
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("approve throws when review not found")
    void approve_notFound() {
        when(reviewRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.approve(UUID.randomUUID(), null))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("reject records reason and sets REJECTED status")
    void reject() {
        Review r = Review.builder().status(ReviewStatus.PENDING).build();
        when(reviewRepository.findById(any())).thenReturn(Optional.of(r));
        when(reviewRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reviewMapper.toDTO(any())).thenReturn(new ReviewDTO());

        service.reject(UUID.randomUUID(), "Inappropriate content", null);

        assertThat(r.getStatus()).isEqualTo(ReviewStatus.REJECTED);
        assertThat(r.getRejectionReason()).isEqualTo("Inappropriate content");
        assertThat(r.getIsPublished()).isFalse();
    }

    @Test
    @DisplayName("bulkModerate handles empty list")
    void bulkModerate_empty() {
        var result = service.bulkModerate(List.of(), "APPROVE", null, null);
        assertThat(result.succeeded()).isZero();
        assertThat(result.failed()).isZero();
    }

    @Test
    @DisplayName("bulkModerate counts successes and failures")
    void bulkModerate_mixed() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Review r1 = Review.builder().status(ReviewStatus.PENDING).build();
        Review r2 = Review.builder().status(ReviewStatus.PENDING).build();

        when(reviewRepository.findById(id1)).thenReturn(Optional.of(r1));
        when(reviewRepository.findById(id2)).thenReturn(Optional.empty());
        when(reviewRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reviewMapper.toDTO(any())).thenReturn(new ReviewDTO());

        var result = service.bulkModerate(List.of(id1, id2), "APPROVE", null, null);

        assertThat(result.succeeded()).isEqualTo(1);
        assertThat(result.failed()).isEqualTo(1);
        assertThat(result.failedIds()).contains(id2);
    }
}

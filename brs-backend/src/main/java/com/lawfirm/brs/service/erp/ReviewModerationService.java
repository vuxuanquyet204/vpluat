package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.ReviewStatus;
import com.lawfirm.brs.controller.content.ReviewController.BulkResultResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ReviewDTO;
import com.lawfirm.brs.entity.Review;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.ReviewMapper;
import com.lawfirm.brs.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Review moderation workflow: filter, approve, reject, bulk operations.
 * Sits alongside {@link com.lawfirm.brs.service.publicapi.ReviewService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewModerationService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @Transactional(readOnly = true)
    public PageResponse<ReviewDTO> list(int page, int size, String status, Integer rating, UUID lawyerId) {
        Specification<Review> spec = (root, q, cb) -> {
            var preds = new ArrayList<jakarta.persistence.criteria.Predicate>();
            if (status != null && !status.isBlank()) {
                preds.add(cb.equal(root.get("status"), ReviewStatus.valueOf(status.toUpperCase())));
            }
            if (rating != null) {
                preds.add(cb.equal(root.get("rating"), rating));
            }
            if (lawyerId != null) {
                preds.add(cb.equal(root.get("lawyer").get("id"), lawyerId));
            }
            return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<Review> result = reviewRepository.findAll(spec,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return PageResponse.of(
            reviewMapper.toDTOList(result.getContent()),
            page, size, result.getTotalElements());
    }

    public ReviewDTO approve(UUID id, UUID moderatorId) {
        Review r = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));
        r.approve(moderatorId);
        return reviewMapper.toDTO(reviewRepository.save(r));
    }

    public ReviewDTO reject(UUID id, String reason, UUID moderatorId) {
        Review r = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));
        r.reject(moderatorId, reason);
        return reviewMapper.toDTO(reviewRepository.save(r));
    }

    public BulkResultResponse bulkModerate(List<UUID> ids, String action, String reason, UUID moderatorId) {
        if (ids == null || ids.isEmpty()) {
            return new BulkResultResponse(0, 0, List.of());
        }
        int ok = 0;
        List<UUID> failed = new ArrayList<>();
        for (UUID id : ids) {
            try {
                if ("APPROVE".equalsIgnoreCase(action)) {
                    approve(id, moderatorId);
                } else if ("REJECT".equalsIgnoreCase(action)) {
                    reject(id, reason, moderatorId);
                } else {
                    throw new IllegalArgumentException("Unknown action: " + action);
                }
                ok++;
            } catch (Exception ex) {
                log.warn("Bulk moderate failed for review {}: {}", id, ex.getMessage());
                failed.add(id);
            }
        }
        return new BulkResultResponse(ok, failed.size(), failed);
    }
}

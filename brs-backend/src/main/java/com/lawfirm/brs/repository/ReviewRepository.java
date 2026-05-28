package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Review repository.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByIsPublishedTrue();

    List<Review> findByIsFeaturedTrueAndIsPublishedTrue();

    List<Review> findByLawyerIdAndIsPublishedTrue(UUID lawyerId);

    List<Review> findByServiceIdAndIsPublishedTrue(UUID serviceId);

    @Query("SELECT r FROM Review r WHERE r.isPublished = true ORDER BY r.createdAt DESC")
    List<Review> findRecentPublishedReviews(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.lawyer.id = :lawyerId AND r.isPublished = true")
    Double findAverageRatingByLawyerId(UUID lawyerId);
}

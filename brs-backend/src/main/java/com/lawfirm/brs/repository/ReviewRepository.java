package com.lawfirm.brs.repository;

import com.lawfirm.brs.constants.ReviewStatus;
import com.lawfirm.brs.entity.Review;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Review repository.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID>, JpaSpecificationExecutor<Review> {

    List<Review> findByIsPublishedTrue();

    List<Review> findByIsFeaturedTrueAndIsPublishedTrue();

    @Query("SELECT r FROM Review r WHERE r.lawyer.id = :lawyerId AND r.isPublished = true")
    List<Review> findByLawyerIdAndIsPublishedTrue(@Param("lawyerId") UUID lawyerId);

    @Query("SELECT r FROM Review r WHERE r.service.id = :serviceId AND r.isPublished = true")
    List<Review> findByServiceIdAndIsPublishedTrue(@Param("serviceId") UUID serviceId);

    @Query("SELECT r FROM Review r WHERE r.isPublished = true ORDER BY r.createdAt DESC")
    List<Review> findRecentPublishedReviews(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.lawyer.id = :lawyerId AND r.isPublished = true")
    Double findAverageRatingByLawyerId(@Param("lawyerId") UUID lawyerId);

    long countByStatus(ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.status = 'APPROVED'")
    Double averageApprovedRating();

    List<Review> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);

    List<Review> findByStatus(ReviewStatus status);
}

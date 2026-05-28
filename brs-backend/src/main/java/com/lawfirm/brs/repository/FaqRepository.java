package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * FAQ repository.
 */
@Repository
public interface FaqRepository extends JpaRepository<Faq, UUID> {

    @Query("SELECT f FROM Faq f WHERE f.service.id = :serviceId AND f.isPublished = true ORDER BY f.displayOrder")
    List<Faq> findByServiceIdAndIsPublishedTrueOrderByDisplayOrder(@Param("serviceId") UUID serviceId);

    List<Faq> findByIsPublishedTrueOrderByDisplayOrder();
}

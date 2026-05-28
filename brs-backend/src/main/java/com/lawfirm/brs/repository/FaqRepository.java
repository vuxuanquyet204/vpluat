package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Faq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * FAQ repository.
 */
@Repository
public interface FaqRepository extends JpaRepository<Faq, UUID> {

    List<Faq> findByServiceIdAndIsPublishedTrueOrderByDisplayOrder(UUID serviceId);

    List<Faq> findByIsPublishedTrueOrderByDisplayOrder();

    @Query("SELECT f FROM Faq f WHERE f.isPublished = true AND LOWER(f.id) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faq> findByQuestionContainingIgnoreCase(String query);

    @Query("SELECT f FROM Faq f WHERE f.isPublished = true AND (LOWER(f.id) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Faq> searchByQuery(String query);
}

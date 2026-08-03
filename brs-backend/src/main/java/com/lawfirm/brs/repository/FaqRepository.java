package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Faq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    Page<Faq> findAllByOrderByDisplayOrderAsc(Pageable pageable);

    Page<Faq> findByIsPublishedOrderByDisplayOrderAsc(Boolean isPublished, Pageable pageable);

    @Query(value = """
        SELECT f.id
        FROM faqs f
        JOIN locale_keys lk
          ON lk.entity_id = f.id
         AND lk.entity_type = 'faq'
         AND lk.locale = :locale
         AND lk.title IS NOT NULL
        WHERE f.is_published = TRUE
          AND f.suggestion_enabled = TRUE
          AND f.deleted_at IS NULL
          AND faq_search_text(lk.title) ILIKE '%' || faq_search_text(:query) || '%'
        ORDER BY similarity(faq_search_text(lk.title), faq_search_text(:query)) DESC,
                 f.display_order ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findSuggestedFaqIds(@Param("query") String query,
                                   @Param("locale") String locale,
                                   @Param("limit") int limit);

    @Query(value = """
        SELECT f.id
        FROM faqs f
        WHERE f.is_published = TRUE
          AND f.suggestion_enabled = TRUE
          AND f.deleted_at IS NULL
          AND (:intent IS NULL
               OR LOWER(:intent) = ANY (string_to_array(LOWER(COALESCE(f.suggested_for, '')), ',')))
        ORDER BY f.display_order ASC, f.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findFallbackFaqIdsForIntent(@Param("intent") String intent,
                                           @Param("limit") int limit);

    @Query(value = """
        SELECT f.id
        FROM faqs f
        WHERE f.is_published = TRUE
          AND f.suggestion_enabled = TRUE
          AND f.deleted_at IS NULL
        ORDER BY f.display_order ASC, f.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<UUID> findTopPublishedFaqIds(@Param("limit") int limit);
}
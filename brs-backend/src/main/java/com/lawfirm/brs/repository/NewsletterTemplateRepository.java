package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.NewsletterTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Newsletter template repository.
 */
@Repository
public interface NewsletterTemplateRepository extends JpaRepository<NewsletterTemplateEntity, UUID> {

    List<NewsletterTemplateEntity> findAllByDeletedAtIsNullOrderByUpdatedAtDesc();

    Optional<NewsletterTemplateEntity> findByIdAndDeletedAtIsNull(UUID id);

    Optional<NewsletterTemplateEntity> findFirstByIsDefaultTrueAndDeletedAtIsNull();

    @Query("""
        SELECT t FROM NewsletterTemplateEntity t
        WHERE t.deletedAt IS NULL AND LOWER(t.name) = LOWER(:name)
        """)
    Optional<NewsletterTemplateEntity> findActiveByNameIgnoreCase(@Param("name") String name);

    /**
     * Clear {@code is_default} on every active row so a new default can be set.
     * Called inside the same transaction as the {@code setDefault} insert/update.
     */
    @Modifying
    @Query("UPDATE NewsletterTemplateEntity t SET t.isDefault = FALSE WHERE t.isDefault = TRUE AND t.deletedAt IS NULL")
    int clearAllDefaults();
}

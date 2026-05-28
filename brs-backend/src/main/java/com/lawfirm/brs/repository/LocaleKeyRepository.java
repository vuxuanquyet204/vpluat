package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LocaleKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocaleKeyRepository extends JpaRepository<LocaleKey, UUID> {

    Optional<LocaleKey> findByEntityTypeAndEntityIdAndLocale(String entityType, UUID entityId, String locale);

    @Query("SELECT l FROM LocaleKey l WHERE l.entityType = :entityType AND l.entityId = :entityId")
    List<LocaleKey> findAllByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") UUID entityId);

    @Query("SELECT l FROM LocaleKey l WHERE l.entityType = 'faq' AND l.locale = :locale AND " +
           "(LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<LocaleKey> searchFaqsByQuery(@Param("query") String query, @Param("locale") String locale);
}

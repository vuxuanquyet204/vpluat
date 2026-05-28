package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Document repository.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    @Query("SELECT d FROM Document d WHERE d.service.id = :serviceId AND d.deletedAt IS NULL")
    List<Document> findByServiceIdAndDeletedAtIsNull(@Param("serviceId") UUID serviceId);

    List<Document> findByIsPublicTrueAndDeletedAtIsNull();
}

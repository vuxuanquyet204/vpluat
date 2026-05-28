package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Document repository.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByServiceIdAndDeletedAtIsNull(UUID serviceId);

    List<Document> findByIsPublicTrueAndDeletedAtIsNull();
}

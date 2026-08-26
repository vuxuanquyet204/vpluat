package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Audit log repository.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByUserId(UUID userId);

    List<AuditLog> findByAction(String action);

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, UUID entityId);

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, UUID entityId);

    List<AuditLog> findByActionAndCreatedAtBetween(String action, Instant from, Instant to);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByCreatedAtBefore(Instant before);

    long deleteByCreatedAtBefore(Instant before);

    @Query("select a from AuditLog a where (:userId is null or a.userId = :userId) "
        + "and (:action is null or lower(a.action) = lower(:action)) "
        + "and (:entityType is null or lower(a.entityType) = lower(:entityType)) "
        + "and (:entityId is null or a.entityId = :entityId) "
        + "and a.createdAt >= :from and a.createdAt < :to "
        + "order by a.createdAt desc")
    Page<AuditLog> search(
        @Param("userId") UUID userId,
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("entityId") UUID entityId,
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );
}

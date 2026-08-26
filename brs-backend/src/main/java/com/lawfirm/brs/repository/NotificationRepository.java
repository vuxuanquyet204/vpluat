package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Notification repository.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /** Inbox for a specific user (broadcasts included). */
    @Query("""
        SELECT n FROM Notification n
        WHERE n.userId = :userId
        ORDER BY n.createdAt DESC
    """)
    Page<Notification> findInbox(@Param("userId") UUID userId, Pageable pageable);

    @Query("""
        SELECT COUNT(n) FROM Notification n
        WHERE n.userId = :userId
          AND n.isRead = false
    """)
    long countUnread(@Param("userId") UUID userId);

    @Modifying
    @Query("""
        UPDATE Notification n SET n.isRead = true
        WHERE n.id = :id
          AND n.userId = :userId
    """)
    int markRead(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying
    @Query("""
        UPDATE Notification n SET n.isRead = true
        WHERE n.userId = :userId
          AND n.isRead = false
    """)
    int markAllRead(@Param("userId") UUID userId);
}
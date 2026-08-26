package com.lawfirm.brs.service.notification;

import com.lawfirm.brs.dto.response.NotificationDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.Notification;
import com.lawfirm.brs.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * In-app notification service: surfaces lead / booking / review / post
 * events to staff & admin users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationService {

    private final NotificationRepository repo;

    // === Notification type constants ===
    public static final String TYPE_LEAD_NEW = "LEAD_NEW";
    public static final String TYPE_LEAD_ASSIGNED = "LEAD_ASSIGNED";
    public static final String TYPE_BOOKING_NEW = "BOOKING_NEW";
    public static final String TYPE_BOOKING_RESCHEDULED = "BOOKING_RESCHEDULED";
    public static final String TYPE_REVIEW_PENDING = "REVIEW_PENDING";
    public static final String TYPE_REVIEW_APPROVED = "REVIEW_APPROVED";
    public static final String TYPE_POST_PUBLISHED = "POST_PUBLISHED";
    public static final String TYPE_SYSTEM = "SYSTEM";

    /**
     * Create a notification for a specific user. Pass userId=null for broadcast.
     */
    @Transactional
    public NotificationDTO create(
        UUID userId,
        String type,
        String title,
        String message,
        String link,
        String entityType,
        UUID entityId
    ) {
        Notification n = Notification.builder()
            .userId(userId)
            .type(type)
            .title(title)
            .message(message)
            .link(link)
            .entityType(entityType)
            .entityId(entityId)
            .isRead(false)
            .build();
        n = repo.save(n);
        log.debug("Created notification {} for user {}: {}", n.getId(), userId, title);
        return toDTO(n);
    }

    /** Broadcast shortcut (visible to all staff). */
    @Transactional
    public NotificationDTO broadcast(String type, String title, String message, String link, String entityType, UUID entityId) {
        return create(null, type, title, message, link, entityType, entityId);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> list(UUID userId, int page, int size) {
        Page<Notification> p = repo.findInbox(userId, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100)));
        return PageResponse.of(
            p.getContent().stream().map(this::toDTO).toList(),
            p.getNumber(),
            p.getSize(),
            p.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return repo.countUnread(userId);
    }

    @Transactional
    public boolean markRead(UUID id, UUID userId) {
        return repo.markRead(id, userId) > 0;
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return repo.markAllRead(userId);
    }

    // === Domain helpers ===

    public void notifyLeadCreated(UUID leadId, String leadName) {
        broadcast(
            TYPE_LEAD_NEW,
            "Lead mới",
            "Khách hàng " + leadName + " vừa để lại thông tin",
            "/staff/crm",
            "lead",
            leadId
        );
    }

    public void notifyLeadAssigned(UUID leadId, String leadName, UUID assigneeId) {
        create(
            assigneeId,
            TYPE_LEAD_ASSIGNED,
            "Bạn được phân công lead",
            "Bạn vừa được phân công xử lý lead: " + leadName,
            "/staff/crm",
            "lead",
            leadId
        );
    }

    public void notifyBookingCreated(UUID bookingId, String clientName) {
        broadcast(
            TYPE_BOOKING_NEW,
            "Lịch hẹn mới",
            clientName + " vừa đặt lịch hẹn",
            "/staff/bookings",
            "booking",
            bookingId
        );
    }

    /**
     * Same as notifyBookingCreated but runs in its own transaction so a
     * failure (e.g. notifications table missing, constraint violation) does
     * NOT roll back the booking transaction that called it.
     */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void notifyBookingCreatedSafely(UUID bookingId, String clientName) {
        notifyBookingCreated(bookingId, clientName);
    }

    public void notifyReviewPending(UUID reviewId, String clientName) {
        broadcast(
            TYPE_REVIEW_PENDING,
            "Đánh giá chờ duyệt",
            clientName + " vừa để lại đánh giá mới",
            "/staff/reviews",
            "review",
            reviewId
        );
    }

    private NotificationDTO toDTO(Notification n) {
        return NotificationDTO.builder()
            .id(n.getId() != null ? n.getId().toString() : null)
            .type(n.getType())
            .title(n.getTitle())
            .message(n.getMessage())
            .link(n.getLink())
            .entityType(n.getEntityType())
            .entityId(n.getEntityId() != null ? n.getEntityId().toString() : null)
            .isRead(Boolean.TRUE.equals(n.getIsRead()))
            .createdAt(n.getCreatedAt())
            .build();
    }
}
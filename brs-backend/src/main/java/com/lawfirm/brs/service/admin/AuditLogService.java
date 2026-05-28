package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.entity.AuditLog;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for logging audit events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log an audit event synchronously
     */
    @Transactional
    public void log(User user, String action, String entityType, UUID entityId,
                   Object oldData, Object newData, String ipAddress, String userAgent) {
        logEvent(user != null ? user.getId() : null, action, entityType, entityId,
                 serializeData(oldData), serializeData(newData), ipAddress, userAgent);
    }

    /**
     * Log an audit event asynchronously (non-blocking)
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAsync(UUID userId, String action, String entityType, UUID entityId,
                         Object oldData, Object newData, String ipAddress, String userAgent) {
        logEvent(userId, action, entityType, entityId,
                 serializeData(oldData), serializeData(newData), ipAddress, userAgent);
    }

    private void logEvent(UUID userId, String action, String entityType, UUID entityId,
                          String oldData, String newData, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
            .userId(userId)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .oldData(oldData)
            .newData(newData)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .createdAt(Instant.now())
            .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit log created: action={}, entityType={}, entityId={}",
                  action, entityType, entityId);
    }

    /**
     * Get audit logs for a specific entity
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForEntity(String entityType, UUID entityId) {
        log.debug("Fetching audit logs for {}: {}", entityType, entityId);
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    /**
     * Get audit logs for a specific user
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsForUser(UUID userId) {
        log.debug("Fetching audit logs for user: {}", userId);
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get audit logs by action type
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByAction(String action) {
        log.debug("Fetching audit logs for action: {}", action);
        return auditLogRepository.findByAction(action);
    }

    /**
     * Log user login
     */
    public void logLogin(User user, String ipAddress, String userAgent) {
        log(user, "LOGIN", "USER", user.getId(), null, null, ipAddress, userAgent);
    }

    /**
     * Log user logout
     */
    public void logLogout(User user, String ipAddress, String userAgent) {
        log(user, "LOGOUT", "USER", user.getId(), null, null, ipAddress, userAgent);
    }

    /**
     * Log entity creation
     */
    public void logCreation(User user, String entityType, UUID entityId, Object data, String ipAddress, String userAgent) {
        log(user, "CREATE", entityType, entityId, null, data, ipAddress, userAgent);
    }

    /**
     * Log entity update
     */
    public void logUpdate(User user, String entityType, UUID entityId, Object oldData, Object newData, String ipAddress, String userAgent) {
        log(user, "UPDATE", entityType, entityId, oldData, newData, ipAddress, userAgent);
    }

    /**
     * Log entity deletion
     */
    public void logDeletion(User user, String entityType, UUID entityId, Object data, String ipAddress, String userAgent) {
        log(user, "DELETE", entityType, entityId, data, null, ipAddress, userAgent);
    }

    private String serializeData(Object data) {
        if (data == null) {
            return null;
        }
        try {
            if (data instanceof String) {
                return (String) data;
            }
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data);
        } catch (Exception e) {
            log.warn("Failed to serialize audit data", e);
            return data.toString();
        }
    }
}

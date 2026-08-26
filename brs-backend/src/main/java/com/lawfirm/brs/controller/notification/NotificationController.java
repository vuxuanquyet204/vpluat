package com.lawfirm.brs.controller.notification;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.NotificationDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.security.UserPrincipal;
import com.lawfirm.brs.service.notification.InAppNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * In-app notification endpoints (used by staff/admin topbar bell icon).
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notifications", description = "In-app notifications inbox")
public class NotificationController {

    private final InAppNotificationService service;

    @GetMapping
    @Operation(summary = "List notifications for the current user (includes broadcasts)")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> list(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            service.list(user.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count unread notifications")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(
            @AuthenticationPrincipal UserPrincipal user) {
        long count = service.unreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> markRead(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("ok", service.markRead(id, user.getId()))));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for the current user")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllRead(
            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("updated", service.markAllRead(user.getId()))));
    }
}
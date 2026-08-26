package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.RoleDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for role management (read-only from enum).
 */
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@Tag(name = "Admin - Roles", description = "Role management endpoints")
public class RoleController {

    @GetMapping
    @Operation(summary = "Get all roles")
    public ResponseEntity<ApiResponse<List<RoleDTO>>> getAllRoles() {
        List<RoleDTO> roles = List.of(
            RoleDTO.builder()
                .id("SUPER_ADMIN")
                .name("Super Admin")
                .description("Full system access")
                .permissions(List.of(
                    "crm.read", "crm.write", "crm.delete",
                    "booking.read", "booking.write", "booking.delete",
                    "blog.read", "blog.write", "blog.publish", "blog.delete",
                    "services.read", "services.write",
                    "lawyers.read", "lawyers.write",
                    "reviews.read", "reviews.moderate", "reviews.reply",
                    "chatbot.read", "chatbot.train", "chatbot.handoff",
                    "newsletter.read", "newsletter.write", "newsletter.send",
                    "users.read", "users.write", "users.impersonate",
                    "settings.read", "settings.write",
                    "audit.read"
                ))
                .isSystem(true)
                .build(),

            RoleDTO.builder()
                .id("ADMIN")
                .name("Admin")
                .description("Administrative functions")
                .permissions(List.of(
                    "crm.read", "crm.write", "crm.delete",
                    "booking.read", "booking.write", "booking.delete",
                    "blog.read", "blog.write", "blog.publish", "blog.delete",
                    "services.read", "services.write",
                    "lawyers.read", "lawyers.write",
                    "reviews.read", "reviews.moderate", "reviews.reply",
                    "chatbot.read",
                    "newsletter.read",
                    "users.read", "users.write",
                    "settings.read", "settings.write",
                    "audit.read"
                ))
                .isSystem(true)
                .build(),

            RoleDTO.builder()
                .id("STAFF")
                .name("Staff")
                .description("Staff member")
                .permissions(List.of(
                    "crm.read", "crm.write",
                    "booking.read", "booking.write",
                    "blog.read", "blog.write",
                    "services.read",
                    "lawyers.read",
                    "reviews.read"
                ))
                .isSystem(true)
                .build(),

            RoleDTO.builder()
                .id("LAWYER")
                .name("Luật sư")
                .description("Legal professional")
                .permissions(List.of(
                    "booking.read", "booking.write",
                    "services.read",
                    "lawyers.read",
                    "reviews.read", "reviews.reply"
                ))
                .isSystem(true)
                .build(),

            RoleDTO.builder()
                .id("CLIENT")
                .name("Khách hàng")
                .description("Client user")
                .permissions(List.of())
                .isSystem(true)
                .build()
        );

        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}

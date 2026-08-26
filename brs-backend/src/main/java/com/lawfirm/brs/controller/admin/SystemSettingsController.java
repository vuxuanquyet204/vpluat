package com.lawfirm.brs.controller.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.entity.SettingsNamespace;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.service.admin.SystemSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
@Tag(name = "Admin - Settings", description = "Namespaced system settings")
public class SystemSettingsController {
    private final SystemSettingsService settingsService;

    @GetMapping("/{namespace}")
    @Operation(summary = "Get a settings namespace")
    public ResponseEntity<ApiResponse<JsonNode>> get(@PathVariable String namespace) {
        return ResponseEntity.ok(ApiResponse.success(settingsService.get(parseNamespace(namespace))));
    }

    @PutMapping("/{namespace}")
    @Operation(summary = "Merge updates into a settings namespace")
    public ResponseEntity<ApiResponse<JsonNode>> update(
            @PathVariable String namespace,
            @RequestBody JsonNode payload) {
        return ResponseEntity.ok(ApiResponse.success(
            settingsService.update(parseNamespace(namespace), payload)));
    }

    private SettingsNamespace parseNamespace(String raw) {
        try {
            return SettingsNamespace.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("INVALID_SETTINGS_NAMESPACE", "Unsupported settings namespace");
        }
    }
}

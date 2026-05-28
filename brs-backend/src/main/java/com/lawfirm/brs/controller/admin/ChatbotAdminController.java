package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.ChatbotResponse;
import com.lawfirm.brs.service.chatbot.ChatbotAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for chatbot administration and monitoring (admin).
 */
@RestController
@RequestMapping("/api/admin/chatbot")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Chatbot", description = "Chatbot administration and monitoring endpoints")
public class ChatbotAdminController {

    private final ChatbotAdminService chatbotAdminService;

    @GetMapping("/sessions")
    @Operation(summary = "List chatbot sessions with pagination")
    public ResponseEntity<ApiResponse<ChatbotAdminService.ChatbotSessionListResult>> getSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean escalated,
            @RequestParam(required = false) Instant startedAfter,
            @RequestParam(required = false) Instant startedBefore) {
        ChatbotAdminService.ChatbotSessionListResult sessions = chatbotAdminService.getSessions(
                page, size, escalated, startedAfter, startedBefore);
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get chatbot session details")
    public ResponseEntity<ApiResponse<ChatbotAdminService.ChatbotSessionDetailResult>> getSessionDetail(@PathVariable UUID id) {
        ChatbotAdminService.ChatbotSessionDetailResult session = chatbotAdminService.getSessionDetail(id);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    @GetMapping("/logs")
    @Operation(summary = "View chatbot conversation logs")
    public ResponseEntity<ApiResponse<List<ChatbotAdminService.ChatbotLogEntry>>> getLogs(
            @RequestParam(required = false) UUID sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        List<ChatbotAdminService.ChatbotLogEntry> logs = chatbotAdminService.getLogs(
                sessionId, page, size, from, to);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get chatbot statistics")
    public ResponseEntity<ApiResponse<ChatbotAdminService.ChatbotStats>> getStats(
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        ChatbotAdminService.ChatbotStats stats = chatbotAdminService.getStats(from, to);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/intents")
    @Operation(summary = "Get intent distribution statistics")
    public ResponseEntity<ApiResponse<List<ChatbotAdminService.IntentStat>>> getIntentStats(
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        List<ChatbotAdminService.IntentStat> intentStats = chatbotAdminService.getIntentStats(from, to);
        return ResponseEntity.ok(ApiResponse.success(intentStats));
    }

    @PutMapping("/config")
    @Operation(summary = "Update chatbot configuration")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateConfig(
            @RequestBody ChatbotConfigUpdateRequest request) {
        Map<String, Object> config = chatbotAdminService.updateConfig(request.config());
        return ResponseEntity.ok(ApiResponse.success("Chatbot configuration updated successfully", config));
    }

    @GetMapping("/config")
    @Operation(summary = "Get current chatbot configuration")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConfig() {
        Map<String, Object> config = chatbotAdminService.getConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PostMapping("/sessions/{id}/escalate")
    @Operation(summary = "Manually escalate a session to human agent")
    public ResponseEntity<ApiResponse<Void>> escalateSession(
            @PathVariable UUID id,
            @RequestBody(required = false) EscalateRequest request) {
        chatbotAdminService.escalateSession(id, request != null ? request.note() : null);
        return ResponseEntity.ok(ApiResponse.success("Session escalated to human agent", null));
    }

    @PostMapping("/sessions/{id}/close")
    @Operation(summary = "Close a chatbot session")
    public ResponseEntity<ApiResponse<Void>> closeSession(@PathVariable UUID id) {
        chatbotAdminService.closeSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session closed successfully", null));
    }

    // Request DTOs
    public record ChatbotConfigUpdateRequest(Map<String, Object> config) {}

    public record EscalateRequest(String note) {}
}

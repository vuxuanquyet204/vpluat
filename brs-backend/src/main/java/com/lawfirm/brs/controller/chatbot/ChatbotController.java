package com.lawfirm.brs.controller.chatbot;

import com.lawfirm.brs.dto.request.ChatbotMessageRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.ChatbotResponse;
import com.lawfirm.brs.service.chatbot.ChatbotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for chatbot.
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "Chatbot endpoints")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Send message to chatbot")
    public ResponseEntity<ApiResponse<ChatbotResponse>> sendMessage(
            @Valid @RequestBody ChatbotMessageRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        ChatbotResponse response = chatbotService.processMessage(request, clientIp, userAgent);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history/{sessionId}")
    @Operation(summary = "Get chat history")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getHistory(
            @PathVariable String sessionId,
            @RequestHeader(value = "X-Session-Id", required = false) String headerSessionId) {
        if (!sessionId.equals(headerSessionId)) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Access denied to this chat session"));
        }
        
        List<Map<String, String>> history = chatbotService.getHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @PostMapping("/handoff")
    @Operation(summary = "Request human handoff")
    public ResponseEntity<ApiResponse<ChatbotResponse>> requestHandoff(
            @RequestParam String sessionId) {
        ChatbotResponse response = ChatbotResponse.handover(sessionId, 
            "Đang chuyển bạn đến bộ phận chăm sóc khách hàng. Vui lòng đợi trong giây lát.");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

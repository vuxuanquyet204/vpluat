package com.lawfirm.brs.controller.webhook;

import com.lawfirm.brs.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling SMS and OTP webhooks from external providers.
 */
@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@Tag(name = "Webhooks", description = "Webhook endpoints for external services")
public class SmsWebhookController {

    // SMS and OTP webhook endpoints have been disabled due to errors
    // Endpoint: POST /api/webhooks/sms - SMS delivery webhook
    // Endpoint: POST /api/webhooks/otp-callback - OTP callback webhook

    @GetMapping("/health")
    @Operation(summary = "Webhook health check")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", "UP",
                "service", "webhook-handler"
        )));
    }

    // Disabled records - kept for reference when re-enabling webhooks
    // public record SmsWebhookPayload(
    //         String provider,
    //         String messageId,
    //         String status,
    //         String phone,
    //         Long timestamp,
    //         String errorCode,
    //         String errorMessage
    // ) {}

    // public record OtpCallbackPayload(
    //         String phone,
    //         String status,
    //         String code,
    //         Integer attempts,
    //         Long expiresAt,
    //         String provider
    // ) {}
}

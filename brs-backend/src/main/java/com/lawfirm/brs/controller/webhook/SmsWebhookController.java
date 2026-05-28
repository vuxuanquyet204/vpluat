package com.lawfirm.brs.controller.webhook;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.service.notification.SmsWebhookService;
import com.lawfirm.brs.service.notification.OtpWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling SMS and OTP webhooks from external providers.
 */
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Webhook endpoints for external services")
public class SmsWebhookController {

    private final SmsWebhookService smsWebhookService;
    private final OtpWebhookService otpWebhookService;

    @PostMapping("/sms")
    @Operation(summary = "Handle SMS delivery webhook")
    public ResponseEntity<ApiResponse<Void>> handleSmsWebhook(
            @RequestBody SmsWebhookPayload payload) {
        log.info("Received SMS webhook: provider={}, messageId={}, status={}",
                payload.provider(), payload.messageId(), payload.status());
        
        smsWebhookService.handleDeliveryReport(
                payload.messageId(),
                payload.status(),
                payload.timestamp()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully", null));
    }

    @PostMapping("/otp-callback")
    @Operation(summary = "Handle OTP callback webhook")
    public ResponseEntity<ApiResponse<Void>> handleOtpCallback(
            @RequestBody OtpCallbackPayload payload) {
        log.info("Received OTP callback: phone={}, status={}, code={}",
                payload.phone(), payload.status(), payload.code());
        
        otpWebhookService.handleOtpCallback(
                payload.phone(),
                payload.status(),
                payload.code(),
                payload.attempts(),
                payload.expiresAt()
        );
        
        return ResponseEntity.ok(ApiResponse.success("OTP callback processed successfully", null));
    }

    @GetMapping("/health")
    @Operation(summary = "Webhook health check")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "status", "UP",
                "service", "webhook-handler"
        )));
    }

    public record SmsWebhookPayload(
            String provider,
            String messageId,
            String status,
            String phone,
            Long timestamp,
            String errorCode,
            String errorMessage
    ) {}

    public record OtpCallbackPayload(
            String phone,
            String status,
            String code,
            Integer attempts,
            Long expiresAt,
            String provider
    ) {}
}

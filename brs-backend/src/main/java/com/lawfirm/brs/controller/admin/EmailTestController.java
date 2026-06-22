package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.config.AppProperties;
import com.lawfirm.brs.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin controller for testing email configuration.
 * Only accessible by ADMIN role.
 */
@RestController
@RequestMapping("/api/admin/email")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class EmailTestController {

    private final EmailService emailService;
    private final AppProperties appProperties;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        String maskedUsername = null;
        String username = appProperties.getMail().getUsername();
        if (username != null && username.length() > 4) {
            maskedUsername = "***" + username.substring(username.length() - 4);
        }

        return ResponseEntity.ok(Map.of(
            "enabled", appProperties.getMail().isEnabled(),
            "host", appProperties.getMail().getHost(),
            "port", appProperties.getMail().getPort(),
            "username", maskedUsername,
            "fromAddress", appProperties.getMail().getFromAddress(),
            "fromName", appProperties.getMail().getFromName()
        ));
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email 'to' is required"));
        }

        try {
            emailService.sendEmail(
                to,
                "Test Email - Van Phong Luat",
                """
                    Day la email test tu Van Phong Luat.

                    Neu ban nhan duoc email nay, cau hinh SMTP da hoat dong!

                    Tran trong,
                    Van Phong Luat
                    """
            );
            return ResponseEntity.ok(Map.of("message", "Test email sent to: " + to));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to send email: " + e.getMessage()));
        }
    }

    @PostMapping("/test/appointment-confirmation")
    public ResponseEntity<Map<String, String>> sendAppointmentTest(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email 'to' is required"));
        }

        emailService.sendAppointmentConfirmation(
            to,
            "Test Khach hang",
            "25/06/2026 10:00",
            "Luat su Nguyen Van A"
        );
        return ResponseEntity.ok(Map.of("message", "Appointment confirmation email sent to: " + to));
    }

    @PostMapping("/test/appointment-reminder")
    public ResponseEntity<Map<String, String>> sendReminderTest(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        if (to == null || to.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email 'to' is required"));
        }

        emailService.sendAppointmentReminder(
            to,
            "Test Khach hang",
            "25/06/2026 14:00",
            "Luat su Tran Thi B"
        );
        return ResponseEntity.ok(Map.of("message", "Appointment reminder email sent to: " + to));
    }
}

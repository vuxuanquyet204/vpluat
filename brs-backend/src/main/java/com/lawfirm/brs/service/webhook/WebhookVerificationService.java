package com.lawfirm.brs.service.webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookVerificationService {

    private static final Duration MAX_TIMESTAMP_DRIFT = Duration.ofMinutes(5);
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Value("${app.webhook.secret:change-this-in-production}")
    private String webhookSecret;

    /**
     * Verify webhook signature with timestamp validation.
     * Throws SecurityException if verification fails.
     */
    public void verifySignature(String payload, String signature, String timestamp) {
        // 1. Verify timestamp is not too old (prevent replay attacks)
        Instant requestTime = Instant.ofEpochSecond(Long.parseLong(timestamp));
        Instant now = Instant.now();
        if (Duration.between(requestTime, now).abs().compareTo(MAX_TIMESTAMP_DRIFT) > 0) {
            throw new SecurityException("Webhook timestamp expired or invalid");
        }

        // 2. Verify HMAC-SHA256 signature
        String expectedSignature = computeHmac(payload + timestamp, webhookSecret);
        if (!secureCompare(expectedSignature, signature)) {
            throw new SecurityException("Invalid webhook signature");
        }
    }

    private String computeHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(keySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }

    /**
     * Constant-time comparison to prevent timing attacks.
     */
    private boolean secureCompare(String expected, String actual) {
        if (expected == null || actual == null || expected.length() != actual.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < expected.length(); i++) {
            result |= expected.charAt(i) ^ actual.charAt(i);
        }
        return result == 0;
    }
}

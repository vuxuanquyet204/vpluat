package com.lawfirm.brs.service.auth;

import com.lawfirm.brs.util.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Random;
import java.util.UUID;

/**
 * OTP Service for appointment verification.
 * [IMPROVED v2] OTP hashed with SHA-256 before storing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redis;
    private final HashUtil hashUtil;

    private static final String OTP_PREFIX = "otp:";
    private static final int OTP_LENGTH = 6;
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 3;

    /**
     * Generate and store OTP for an appointment
     */
    public String generateOtp(UUID appointmentId, String phone) {
        String otp = generateOtpCode();
        String hashedOtp = hashUtil.sha256(otp);
        
        // Store hashed OTP
        redis.opsForValue().set(
            OTP_PREFIX + appointmentId,
            hashedOtp + ":" + phone,
            OTP_TTL
        );
        
        // Store attempt counter
        redis.opsForValue().set(
            OTP_PREFIX + appointmentId + ":attempts",
            "0",
            OTP_TTL
        );
        
        log.info("Generated OTP for appointment: {}", appointmentId);
        
        return otp; // Return plain OTP for SMS sending
    }

    /**
     * Verify OTP for an appointment
     */
    public boolean verifyOtp(UUID appointmentId, String providedOtp) {
        String key = OTP_PREFIX + appointmentId;
        String stored = redis.opsForValue().get(key);
        
        if (stored == null) {
            log.warn("OTP not found or expired for appointment: {}", appointmentId);
            return false;
        }
        
        // Check attempt count
        String attemptsKey = OTP_PREFIX + appointmentId + ":attempts";
        int attempts = Integer.parseInt(
            redis.opsForValue().get(attemptsKey) != null 
                ? redis.opsForValue().get(attemptsKey) 
                : "0"
        );
        
        if (attempts >= MAX_ATTEMPTS) {
            log.warn("Max OTP attempts reached for appointment: {}", appointmentId);
            deleteOtp(appointmentId);
            return false;
        }
        
        // Increment attempts
        redis.opsForValue().increment(attemptsKey);
        
        // Verify OTP
        String hashedProvided = hashUtil.sha256(providedOtp);
        String hashedStored = stored.split(":")[0];
        
        boolean valid = hashedProvided.equals(hashedStored);
        
        if (valid) {
            deleteOtp(appointmentId);
            log.info("OTP verified successfully for appointment: {}", appointmentId);
        } else {
            log.warn("Invalid OTP provided for appointment: {}", appointmentId);
        }
        
        return valid;
    }

    /**
     * Delete OTP after successful verification or expiry
     */
    public void deleteOtp(UUID appointmentId) {
        redis.delete(OTP_PREFIX + appointmentId);
        redis.delete(OTP_PREFIX + appointmentId + ":attempts");
    }

    /**
     * Resend OTP - generates new OTP
     */
    public String resendOtp(UUID appointmentId, String phone) {
        deleteOtp(appointmentId);
        return generateOtp(appointmentId, phone);
    }

    /**
     * Get remaining attempts for OTP
     */
    public int getRemainingAttempts(UUID appointmentId) {
        String attemptsKey = OTP_PREFIX + appointmentId + ":attempts";
        String attempts = redis.opsForValue().get(attemptsKey);
        return attempts != null 
            ? MAX_ATTEMPTS - Integer.parseInt(attempts) 
            : MAX_ATTEMPTS;
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}

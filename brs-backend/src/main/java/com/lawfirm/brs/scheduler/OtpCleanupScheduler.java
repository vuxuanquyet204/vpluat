package com.lawfirm.brs.scheduler;

import com.lawfirm.brs.service.auth.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * Scheduler for cleaning up expired OTP codes from Redis.
 * Ensures Redis storage doesn't grow indefinitely with expired OTPs.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OtpCleanupScheduler {

    private final OtpService otpService;
    private final StringRedisTemplate redisTemplate;

    private static final String OTP_KEY_PREFIX = "otp:";

    /**
     * Clean up expired OTP entries from Redis.
     * Runs every 15 minutes.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void cleanupExpiredOtps() {
        log.debug("Running OTP cleanup scheduler...");
        
        try {
            Set<String> keys = redisTemplate.keys(OTP_KEY_PREFIX + "*");
            
            if (keys == null || keys.isEmpty()) {
                log.debug("No OTP keys found to clean up.");
                return;
            }
            
            int deletedCount = 0;
            int checkedCount = 0;
            
            for (String key : keys) {
                checkedCount++;
                Long ttl = redisTemplate.getExpire(key);
                
                if (ttl == null || ttl < 0) {
                    Boolean deleted = redisTemplate.delete(key);
                    if (Boolean.TRUE.equals(deleted)) {
                        deletedCount++;
                    }
                }
            }
            
            log.info("OTP cleanup completed. Checked {} keys, deleted {} expired entries.", 
                checkedCount, deletedCount);
                
        } catch (Exception e) {
            log.error("Error during OTP cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Verify and log OTP cache health metrics.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void logOtpMetrics() {
        log.debug("Running OTP metrics scheduler...");
        
        try {
            Set<String> keys = redisTemplate.keys(OTP_KEY_PREFIX + "*");
            int activeCount = keys != null ? keys.size() : 0;
            
            log.info("OTP metrics - Active OTP entries: {}", activeCount);
            
        } catch (Exception e) {
            log.error("Error getting OTP metrics: {}", e.getMessage(), e);
        }
    }
}

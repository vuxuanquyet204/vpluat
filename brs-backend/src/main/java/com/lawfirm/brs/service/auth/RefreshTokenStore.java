package com.lawfirm.brs.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * Refresh Token Store - Redis-based storage for token rotation and replay detection.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenStore {

    private final StringRedisTemplate redis;

    private static final String REVOKE_PREFIX = "jwt:revoked:";
    private static final String USER_TOKENS_PREFIX = "jwt:user:";

    /**
     * Revoke a specific token by JTI
     */
    public void revoke(String jti) {
        long ttl = 7 * 24 * 60 * 60; // Default 7 days
        redis.opsForValue().set(REVOKE_PREFIX + jti, "1", Duration.ofSeconds(ttl));
        log.debug("Revoked token: {}", jti);
    }

    /**
     * Check if token is revoked
     */
    public boolean isRevoked(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(REVOKE_PREFIX + jti));
    }

    /**
     * Revoke all tokens for a user (called when reuse attack detected)
     */
    public void revokeAllForUser(String userId) {
        Set<String> tokens = redis.opsForSet().members(USER_TOKENS_PREFIX + userId);
        if (tokens != null && !tokens.isEmpty()) {
            for (String token : tokens) {
                redis.delete(REVOKE_PREFIX + token);
            }
            log.warn("Revoked all tokens for user: {} (count: {})", userId, tokens.size());
        }
        redis.delete(USER_TOKENS_PREFIX + userId);
    }

    /**
     * Save token JTI for a user
     */
    public void saveForUser(String userId, String jti) {
        redis.opsForSet().add(USER_TOKENS_PREFIX + userId, jti);
        redis.expire(USER_TOKENS_PREFIX + userId, Duration.ofDays(8));
    }

    /**
     * Get count of active tokens for a user
     */
    public long getActiveTokenCount(String userId) {
        Long count = redis.opsForSet().size(USER_TOKENS_PREFIX + userId);
        return count != null ? count : 0;
    }
}

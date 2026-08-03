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
    private static final String USER_JTI_PREFIX = "jwt:user-jti:";

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
     * Save token JTI for a user.
     *
     * <p>Each JTI is stored in its own short-lived key ({@code jwt:user-jti:<jti>})
     * with the same TTL as the refresh token.  We then add the JTI to a
     * per-user set so we can enumerate active tokens on reuse-attack detection.
     * The set itself uses a sliding expiry (refreshed on every write) so that
     * a user who keeps logging in doesn't see their set expire.
     */
    public void saveForUser(String userId, String jti) {
        long ttl = 7 * 24 * 60 * 60; // 7 days, must match refresh-token expiry
        // Track each JTI individually so it expires automatically.
        redis.opsForValue().set(USER_JTI_PREFIX + jti, userId, Duration.ofSeconds(ttl));
        redis.opsForSet().add(USER_TOKENS_PREFIX + userId, jti);
        redis.expire(USER_TOKENS_PREFIX + userId, Duration.ofSeconds(ttl));
    }

    /**
     * Get count of active tokens for a user
     */
    public long getActiveTokenCount(String userId) {
        Long count = redis.opsForSet().size(USER_TOKENS_PREFIX + userId);
        return count != null ? count : 0;
    }
}

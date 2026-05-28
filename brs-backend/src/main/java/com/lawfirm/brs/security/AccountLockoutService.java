package com.lawfirm.brs.security;

import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Service for account lockout after failed login attempts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccountLockoutService {

    private final UserRepository userRepository;
    private final StringRedisTemplate redis;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCKOUT_DURATION = Duration.ofMinutes(30);
    private static final String LOCKOUT_PREFIX = "auth:lockout:";

    public void recordFailedLogin(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);

            if (attempts >= MAX_FAILED_ATTEMPTS) {
                Instant lockoutUntil = Instant.now().plus(LOCKOUT_DURATION);
                user.setLockedUntil(lockoutUntil);
                redis.opsForValue().set(LOCKOUT_PREFIX + email, lockoutUntil.toString(), LOCKOUT_DURATION);
                log.warn("Account locked due to {} failed attempts: {}", attempts, email);
            }

            userRepository.save(user);
        });
    }

    public void resetFailedAttempts(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedAttempts(0);
            user.setLockedUntil(null);
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
            redis.delete(LOCKOUT_PREFIX + email);
        });
    }

    public boolean isLocked(String email) {
        String lockoutTime = redis.opsForValue().get(LOCKOUT_PREFIX + email);
        if (lockoutTime != null) {
            Instant lockoutUntil = Instant.parse(lockoutTime);
            return lockoutUntil.isAfter(Instant.now());
        }
        return false;
    }

    public Instant getLockoutTimeRemaining(String email) {
        String lockoutTime = redis.opsForValue().get(LOCKOUT_PREFIX + email);
        if (lockoutTime != null) {
            return Instant.parse(lockoutTime);
        }
        return null;
    }
}

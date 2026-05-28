package com.lawfirm.brs.service.auth;

import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.UnauthorizedException;
import com.lawfirm.brs.repository.UserRepository;
import com.lawfirm.brs.util.HashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Authentication service handling login, token generation, and user management.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenStore refreshTokenStore;
    private final PasswordEncoder passwordEncoder;
    private final HashUtil hashUtil;

    /**
     * Authenticate user and generate tokens
     */
    @Transactional
    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if account is locked
        if (user.isLocked()) {
            log.warn("Login attempt on locked account: {}", email);
            throw new UnauthorizedException("ACCOUNT_LOCKED", "Account is temporarily locked");
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            user.recordFailedAttempt();
            userRepository.save(user);
            log.warn("Failed login attempt for: {}", email);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reset failed attempts on successful login
        user.resetFailedAttempts();
        userRepository.save(user);

        // Generate tokens
        JwtTokenProvider.TokenPair tokens = jwtTokenProvider.generateTokenPair(user);

        log.info("Successful login for: {}", email);

        return Map.of(
            "accessToken", tokens.accessToken(),
            "refreshToken", tokens.refreshToken(),
            "expiresIn", 900, // 15 minutes
            "user", toUserDTO(user)
        );
    }

    /**
     * Refresh access token using refresh token
     */
    public Map<String, Object> refreshToken(String refreshToken) {
        JwtTokenProvider.TokenPair tokens = jwtTokenProvider.rotateRefreshToken(refreshToken);

        String email = jwtTokenProvider.getUsernameFromToken(tokens.accessToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));

        return Map.of(
            "accessToken", tokens.accessToken(),
            "refreshToken", tokens.refreshToken(),
            "expiresIn", 900,
            "user", toUserDTO(user)
        );
    }

    /**
     * Logout user by revoking tokens
     */
    public void logout(String email, String refreshToken) {
        if (refreshToken != null) {
            try {
                String jti = jwtTokenProvider.extractJti(refreshToken);
                refreshTokenStore.revoke(jti);
            } catch (Exception e) {
                log.warn("Could not revoke token: {}", e.getMessage());
            }
        }
        log.info("User logged out: {}", email);
    }

    /**
     * Get current user profile
     */
    public UserDTO getCurrentUser(User user) {
        return toUserDTO(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserDTO updateProfile(User user, Map<String, String> updates) {
        if (updates.containsKey("fullName")) {
            user.setFullName(updates.get("fullName"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone(updates.get("phone"));
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl(updates.get("avatarUrl"));
        }

        User saved = userRepository.save(user);
        log.info("Profile updated for: {}", user.getEmail());
        return toUserDTO(saved);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException("INVALID_PASSWORD", "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Revoke all existing tokens
        jwtTokenProvider.revokeAllUserTokens(user.getEmail());

        log.info("Password changed for: {}", user.getEmail());
    }

    /**
     * Request password reset
     */
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // TODO: Generate reset token and send email
            log.info("Password reset requested for: {}", email);
        });
    }

    /**
     * Reset password using token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // TODO: Validate token and reset password
        log.info("Password reset with token");
    }

    private UserDTO toUserDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .role(user.getRole().name())
            .avatarUrl(user.getAvatarUrl())
            .isActive(user.getIsActive())
            .build();
    }
}

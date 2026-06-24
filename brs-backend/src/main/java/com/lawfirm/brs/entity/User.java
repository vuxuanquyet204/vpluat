package com.lawfirm.brs.entity;

import com.lawfirm.brs.constants.Roles;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * User entity with authentication and authorization support.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Roles role;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Account lockout fields [IMPROVED v2]
    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "failed_attempts", nullable = false)
    @Builder.Default
    private Integer failedAttempts = 0;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "sessions_count", nullable = false)
    @Builder.Default
    private Integer sessionsCount = 0;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return lockedUntil == null || lockedUntil.isBefore(Instant.now());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    /**
     * Check if account is currently locked
     */
    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }

    /**
     * Lock account for specified duration
     */
    public void lockAccount(Instant until) {
        this.lockedUntil = until;
    }

    /**
     * Unlock account and reset failed attempts
     */
    public void unlockAccount() {
        this.lockedUntil = null;
        this.failedAttempts = 0;
    }

    /**
     * Record failed login attempt
     */
    public void recordFailedAttempt() {
        this.failedAttempts++;
    }

    /**
     * Reset failed login attempts after successful login
     */
    public void resetFailedAttempts() {
        this.failedAttempts = 0;
        this.lockedUntil = null;
        this.lastLoginAt = Instant.now();
    }
}

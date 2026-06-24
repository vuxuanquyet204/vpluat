package com.lawfirm.brs.config;

import com.lawfirm.brs.entity.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Provides the current auditor (user) for JPA auditing.
 * Returns the user ID directly from SecurityContext to avoid recursive DB lookups
 * that would trigger another audit flush.
 */
@Component
public class AuditorProvider implements AuditorAware<UUID> {

    @Override
    public Optional<UUID> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return Optional.ofNullable(user.getId());
        }

        return Optional.empty();
    }

    public Optional<UUID> getCurrentUserId() {
        return getCurrentAuditor();
    }
}

package com.lawfirm.brs.config;

import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Provides the current auditor (user) for JPA auditing.
 */
@Component
@RequiredArgsConstructor
public class AuditorProvider implements AuditorAware<UUID> {

    private final UserRepository userRepository;

    @Override
    public Optional<UUID> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof User user) {
            return Optional.of(user.getId());
        }
        
        if (principal instanceof String email) {
            return userRepository.findByEmail(email).map(User::getId);
        }
        
        return Optional.empty();
    }

    public Optional<UUID> getCurrentUserId() {
        return getCurrentAuditor();
    }
}

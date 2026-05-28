package com.lawfirm.brs.service.auth;

import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> {
                log.warn("User not found: {}", email);
                return new UsernameNotFoundException("User not found: " + email);
            });

        if (!user.getIsActive()) {
            log.warn("User account is inactive: {}", email);
            throw new UsernameNotFoundException("User account is inactive");
        }

        return user;
    }
}

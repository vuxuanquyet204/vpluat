package com.lawfirm.brs.config;

import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds default admin account on startup if not exists.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@luathung.vn";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_NAME = "Quan tri vien";

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail(ADMIN_EMAIL).isEmpty()) {
            User admin = User.builder()
                .email(ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                .fullName(ADMIN_NAME)
                .phone("0901234567")
                .role(Roles.ADMIN)
                .isActive(true)
                .build();

            userRepository.save(admin);
            log.info("Created default admin: {} / {}", ADMIN_EMAIL, ADMIN_PASSWORD);
        } else {
            log.info("Admin account already exists: {}", ADMIN_EMAIL);
        }
    }
}

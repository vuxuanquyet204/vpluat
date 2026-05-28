package com.lawfirm.brs.service.auth;

import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.repository.jpa.UserRepository;
import com.lawfirm.brs.util.HashUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RefreshTokenStore refreshTokenStore;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HashUtil hashUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("$2a$12$hashedpassword");
        testUser.setFullName("Test User");
        testUser.setPhone("0912345678");
        testUser.setIsActive(true);
        testUser.setFailedAttempts(0);
        testUser.setLockedUntil(null);
        testUser.setRole(Roles.USER);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void shouldLoginSuccessfully() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateTokenPair(any(User.class)))
            .thenReturn(new JwtTokenProvider.TokenPair("access-token", "refresh-token", Instant.now(), Instant.now()));

        // When
        var result = authService.login("test@example.com", "password123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.get("accessToken")).isEqualTo("access-token");
        assertThat(result.get("refreshToken")).isEqualTo("refresh-token");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> authService.login("nonexistent@example.com", "password"))
            .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Should throw exception when account is locked")
    void shouldThrowExceptionWhenAccountLocked() {
        // Given
        testUser.setLockedUntil(Instant.now().plusSeconds(1800));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When/Then
        assertThatThrownBy(() -> authService.login("test@example.com", "password"))
            .isInstanceOf(Exception.class);
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void shouldThrowExceptionWhenPasswordIncorrect() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", testUser.getPasswordHash())).thenReturn(false);

        // When/Then
        assertThatThrownBy(() -> authService.login("test@example.com", "wrongpassword"))
            .isInstanceOf(BadCredentialsException.class);

        verify(userRepository).save(any(User.class));
    }
}

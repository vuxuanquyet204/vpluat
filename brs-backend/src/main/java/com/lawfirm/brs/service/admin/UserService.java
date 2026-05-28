package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing users (admin operations).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new user
     */
    @Transactional
    public UserDTO createUser(String email, String password, String fullName, String role, String phone) {
        log.info("Creating user: {}", email);

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("USER_EXISTS", "User with email already exists: " + email);
        }

        User user = User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(password))
            .fullName(fullName)
            .phone(phone)
            .role(Roles.valueOf(role != null ? role : "USER"))
            .isActive(true)
            .build();

        User saved = userRepository.save(user);
        log.info("Created user: {} with role: {}", saved.getId(), saved.getRole());
        return toUserDTO(saved);
    }

    /**
     * Update user details
     */
    @Transactional
    public UserDTO updateUser(UUID id, String fullName, String phone, String avatarUrl) {
        log.info("Updating user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        User saved = userRepository.save(user);
        log.info("Updated user: {}", id);
        return toUserDTO(saved);
    }

    /**
     * Change user role
     */
    @Transactional
    public UserDTO changeRole(UUID id, String role) {
        log.info("Changing role for user {} to: {}", id, role);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        Roles newRole;
        try {
            newRole = Roles.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("INVALID_ROLE", "Invalid role: " + role);
        }

        user.setRole(newRole);
        User saved = userRepository.save(user);
        log.info("Changed role for user {} to: {}", id, newRole);
        return toUserDTO(saved);
    }

    /**
     * Deactivate user account
     */
    @Transactional
    public void deactivateUser(UUID id) {
        log.info("Deactivating user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("Deactivated user: {}", id);
    }

    /**
     * Activate user account
     */
    @Transactional
    public void activateUser(UUID id) {
        log.info("Activating user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setIsActive(true);
        userRepository.save(user);
        log.info("Activated user: {}", id);
    }

    /**
     * Reset user password
     */
    @Transactional
    public void resetPassword(UUID id, String newPassword) {
        log.info("Resetting password for user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset for user: {}", id);
    }

    /**
     * Get user by ID
     */
    public UserDTO getUserById(UUID id) {
        log.debug("Fetching user: {}", id);

        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toUserDTO(user);
    }

    /**
     * Get user entity by ID (internal use)
     */
    public User getUserEntityById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    /**
     * Get user by email
     */
    public UserDTO getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toUserDTO(user);
    }

    /**
     * Get all users with pagination
     */
    public Page<UserDTO> getAllUsers(int page, int size, String sortBy, String direction) {
        log.debug("Fetching users: page={}, size={}, sortBy={}, direction={}", page, size, sortBy, direction);

        Sort sort = Sort.by(
            Sort.Direction.fromString(direction != null ? direction : "ASC"),
            sortBy != null ? sortBy : "createdAt"
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::toUserDTO);
    }

    /**
     * Get all active users
     */
    public List<UserDTO> getActiveUsers() {
        log.debug("Fetching active users");
        return userRepository.findAll().stream()
                .filter(User::getIsActive)
                .map(this::toUserDTO)
                .toList();
    }

    /**
     * Get users by role
     */
    public List<UserDTO> getUsersByRole(String role) {
        log.debug("Fetching users by role: {}", role);
        Roles targetRole = Roles.valueOf(role);
        return userRepository.findAll().stream()
            .filter(u -> u.getRole() == targetRole)
            .map(this::toUserDTO)
            .toList();
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

package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.dto.request.RegisterRequest;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.mapper.UserMapper;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for managing users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserManagementService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserDTO> getAllUsers(int page, int size, String role, Boolean isActive) {
        log.debug("Fetching users: page={}, size={}, role={}, isActive={}", page, size, role, isActive);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageRequest);
        
        return PageResponse.<UserDTO>builder()
                .content(userMapper.toDTOList(userPage.getContent()))
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(UUID id) {
        log.debug("Fetching user by id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return userMapper.toDTO(user);
    }

    public UserDTO createUser(RegisterRequest request) {
        log.debug("Creating user: {}", request.email());
        
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already exists: " + request.email());
        }
        
        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(Roles.USER)
                .isActive(true)
                .build();
        
        return userMapper.toDTO(userRepository.save(user));
    }

    public UserDTO updateUser(UUID id, UpdateUserRequest request) {
        log.debug("Updating user: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        
        return userMapper.toDTO(userRepository.save(user));
    }

    public UserDTO changeUserRole(UUID id, String role) {
        log.debug("Changing user role: id={}, role={}", id, role);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        user.setRole(Roles.valueOf(role));
        return userMapper.toDTO(userRepository.save(user));
    }

    public UserDTO toggleUserActive(UUID id) {
        log.debug("Toggling user active status: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        user.setIsActive(!user.getIsActive());
        return userMapper.toDTO(userRepository.save(user));
    }

    public void deleteUser(UUID id) {
        log.debug("Deleting user: {}", id);
        userRepository.deleteById(id);
    }

    public record UpdateUserRequest(String fullName, String phone, String avatarUrl) {}
}

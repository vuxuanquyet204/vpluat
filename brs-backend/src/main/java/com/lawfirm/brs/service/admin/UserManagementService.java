package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.dto.request.RegisterRequest;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.mapper.UserMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
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
    private final LawyerProfileRepository lawyerProfileRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

@Transactional(readOnly = true)
    public PageResponse<UserDTO> getAllUsers(int page, int size, String role, Boolean isActive) {
        log.debug("Fetching users: page={}, size={}, role={}, isActive={}", page, size, role, isActive);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<User> userPage;

        boolean hasRole = role != null && !role.isBlank() && !"all".equalsIgnoreCase(role);
        Roles parsedRole = null;
        if (hasRole) {
            try {
                parsedRole = Roles.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role filter '{}', ignoring", role);
                hasRole = false;
            }
        }

        if (hasRole && parsedRole != null && isActive != null) {
            userPage = userRepository.findByRoleAndIsActive(parsedRole, isActive, pageRequest);
        } else if (hasRole && parsedRole != null) {
            userPage = userRepository.findByRole(parsedRole, pageRequest);
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

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

        String roleStr = request.role();
        Roles role = Roles.USER;
        if (roleStr != null && !roleStr.isBlank()) {
            try {
                role = Roles.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role '{}', defaulting to USER", roleStr);
            }
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(role)
                .isActive(true)
                .build();

        User saved = userRepository.save(user);

        // Nếu role = LAWYER, tự động tạo LawyerProfile rỗng liên kết với user
        if (role == Roles.LAWYER) {
            ensureLawyerProfile(saved);
        }

        return userMapper.toDTO(saved);
    }

    public UserDTO updateUser(UUID id, UpdateUserRequest request) {
        log.debug("Updating user: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        Roles oldRole = user.getRole();

        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.email() != null && !request.email().isBlank()
                && !request.email().equalsIgnoreCase(user.getEmail())) {
            // Check trùng email trước khi cập nhật
            if (userRepository.findByEmail(request.email()).isPresent()) {
                throw new RuntimeException("Email already exists: " + request.email());
            }
            user.setEmail(request.email());
        }
        if (request.role() != null && !request.role().isBlank()) {
            try {
                user.setRole(Roles.valueOf(request.role().toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role '{}' in update, ignoring", request.role());
            }
        }
        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }

        User saved = userRepository.save(user);

        // Đồng bộ LawyerProfile theo role mới
        Roles newRole = saved.getRole();
        if (newRole == Roles.LAWYER) {
            ensureLawyerProfile(saved);
        } else if (oldRole == Roles.LAWYER) {
            // Hạ từ LAWYER xuống role khác → xóa profile
            removeLawyerProfile(saved);
        }

        return userMapper.toDTO(saved);
    }

    /**
     * Xóa LawyerProfile liên kết với user (khi user bị hạ role từ LAWYER).
     */
    private void removeLawyerProfile(User user) {
        lawyerProfileRepository.findByUser_Id(user.getId())
                .ifPresent(profile -> {
                    lawyerProfileRepository.delete(profile);
                    log.debug("Removed LawyerProfile for user {} (role downgraded from LAWYER)", user.getEmail());
                });
    }

    /**
     * Đảm bảo user có role=LAWYER luôn đi kèm LawyerProfile.
     * - Nếu chưa có: tạo mới với slug = email base, name_vi = fullName.
     * - Nếu có rồi: đồng bộ fullName/phone/avatarUrl.
     */
    private void ensureLawyerProfile(User user) {
        LawyerProfile profile = lawyerProfileRepository.findByUser_Id(user.getId()).orElse(null);

        if (profile == null) {
            String slug = generateSlug(user.getEmail(), user.getFullName());
            profile = LawyerProfile.builder()
                    .user(user)
                    .slug(slug)
                    .nameVi(user.getFullName() != null ? user.getFullName() : user.getEmail())
                    .nameEn(user.getFullName() != null ? user.getFullName() : user.getEmail())
                    .avatarUrl(user.getAvatarUrl())
                    .isFeatured(true)
                    .build();
            lawyerProfileRepository.save(profile);
            log.debug("Auto-created LawyerProfile for LAWYER user: {}", user.getEmail());
        } else {
            // Đồng bộ thông tin từ User sang profile (giữ nguyên các field do lawyer quản lý)
            if (user.getFullName() != null && (profile.getNameVi() == null || profile.getNameVi().isBlank())) {
                profile.setNameVi(user.getFullName());
                profile.setNameEn(user.getFullName());
            }
            if (user.getAvatarUrl() != null && (profile.getAvatarUrl() == null || profile.getAvatarUrl().isBlank())) {
                profile.setAvatarUrl(user.getAvatarUrl());
            }
            lawyerProfileRepository.save(profile);
        }
    }

    private String generateSlug(String email, String fullName) {
        String base = fullName != null && !fullName.isBlank() ? fullName : (email != null ? email : "lawyer");
        String slug = base.toLowerCase()
                .replaceAll("[đĐ]", "d")
                .replaceAll("[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ]", "")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isBlank()) slug = "lawyer-" + System.currentTimeMillis();

        // Đảm bảo unique
        String candidate = slug;
        int suffix = 1;
        while (lawyerProfileRepository.existsBySlug(candidate)) {
            candidate = slug + "-" + suffix++;
        }
        return candidate;
    }

    public UserDTO changeUserRole(UUID id, String role) {
        log.debug("Changing user role: id={}, role={}", id, role);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        Roles newRole;
        try {
            newRole = Roles.valueOf(role);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Invalid role: " + role + ". Valid: " + java.util.Arrays.toString(Roles.values()));
        }

        Roles oldRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        // Đồng bộ LawyerProfile theo role mới
        if (newRole == Roles.LAWYER) {
            ensureLawyerProfile(saved);
        } else if (oldRole == Roles.LAWYER) {
            // Role bị hạ từ LAWYER xuống role khác → xóa profile để tránh rác
            removeLawyerProfile(saved);
        }

        return userMapper.toDTO(saved);
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

    public record UpdateUserRequest(String email, String fullName, String phone, String avatarUrl, String role, Boolean isActive) {}
}

package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.Roles;
import com.lawfirm.brs.dto.request.LawyerRequest;
import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.mapper.LawyerMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing lawyer profiles.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LawyerManagementService {

    private final LawyerProfileRepository lawyerRepository;
    private final LawyerMapper lawyerMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Caching(evict = {
        @CacheEvict(value = "lawyers", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public LawyerDTO createLawyer(LawyerRequest request) {
        log.debug("Creating lawyer: {}", request.slug());

        // Validate slug unique trước khi save (tránh DataIntegrityViolationException)
        if (lawyerRepository.existsBySlug(request.slug())) {
            throw new RuntimeException("Slug already exists: " + request.slug());
        }

        // Sanitize + fallback các field optional
        String nameVi = request.nameVi() != null ? request.nameVi().trim() : "";
        String nameEn = request.nameEn() != null && !request.nameEn().isBlank()
                ? request.nameEn().trim()
                : nameVi;
        // positionVi/En: nếu trống → fallback về name (giảm lỗi BE khi FE quên gửi)
        String positionVi = request.positionVi() != null && !request.positionVi().isBlank()
                ? request.positionVi().trim()
                : "Luật sư";
        String positionEn = request.positionEn() != null && !request.positionEn().isBlank()
                ? request.positionEn().trim()
                : "Lawyer";
        String bioVi = request.bioVi();
        String bioEn = request.bioEn() != null && !request.bioEn().isBlank()
                ? request.bioEn()
                : bioVi;

        LawyerProfile lawyer = LawyerProfile.builder()
                .slug(request.slug())
                .nameVi(nameVi)
                .nameEn(nameEn)
                .bioVi(bioVi)
                .bioEn(bioEn)
                .positionVi(positionVi)
                .positionEn(positionEn)
                .experienceYears(request.experienceYears())
                .barNumber(request.barNumber())
                .languages(request.languages() != null ? request.languages().toArray(new String[0]) : null)
                .avatarUrl(request.avatarUrl())
                .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
                .workingHours(request.workingHours())
                .serviceIds(request.serviceIds())
                .build();

        // Create or link user account if email is provided
        if (request.email() != null && !request.email().isBlank()) {
            final String email = request.email();
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        if (request.password() == null || request.password().isBlank()) {
                            throw new RuntimeException("Password is required when creating user account");
                        }
                        return User.builder()
                                .email(email)
                                .passwordHash(passwordEncoder.encode(request.password()))
                                .fullName(request.nameVi())
                                .phone(request.phone())
                                .role(Roles.LAWYER)
                                .isActive(true)
                                .build();
                    });

            // Nếu user đã tồn tại nhưng role khác LAWYER → đảm bảo đồng bộ sang LAWYER
            boolean changed = false;
            if (user.getRole() != Roles.LAWYER) {
                user.setRole(Roles.LAWYER);
                changed = true;
            }
            if (request.nameVi() != null && !request.nameVi().equals(user.getFullName())) {
                user.setFullName(request.nameVi());
                changed = true;
            }
            if (request.phone() != null && !request.phone().equals(user.getPhone())) {
                user.setPhone(request.phone());
                changed = true;
            }
            if (changed) {
                user = userRepository.save(user);
                log.debug("Updated existing user {} to LAWYER role", email);
            }

            lawyer.setUser(user);
            log.debug("Linked lawyer {} to user {}", request.slug(), email);
        }

        LawyerProfile savedLawyer = lawyerRepository.save(lawyer);
        return lawyerMapper.toDTO(savedLawyer);
    }

    @Caching(evict = {
        @CacheEvict(value = "lawyers", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public LawyerDTO updateLawyer(UUID id, LawyerRequest request) {
        return patchLawyer(id, toPatch(request));
    }

    @Caching(evict = {
        @CacheEvict(value = "lawyers", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public LawyerDTO patchLawyer(UUID id, com.lawfirm.brs.dto.request.LawyerPatchRequest request) {
        log.debug("Patching lawyer: {}", id);
        LawyerProfile lawyer = lawyerRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));

        if (request.slug() != null && !request.slug().isBlank() && !request.slug().equals(lawyer.getSlug())) {
            if (lawyerRepository.existsBySlug(request.slug())) {
                throw new RuntimeException("Slug already exists: " + request.slug());
            }
            lawyer.setSlug(request.slug());
        }

        // PATCH semantics: chỉ update khi field != null
        if (request.nameVi() != null) lawyer.setNameVi(request.nameVi().trim());
        if (request.nameEn() != null) lawyer.setNameEn(request.nameEn().trim());
        if (request.bioVi() != null) lawyer.setBioVi(request.bioVi());
        if (request.bioEn() != null) lawyer.setBioEn(request.bioEn().isBlank() ? request.bioVi() : request.bioEn());
        if (request.positionVi() != null) lawyer.setPositionVi(request.positionVi().isBlank() ? "Luật sư" : request.positionVi().trim());
        if (request.positionEn() != null) lawyer.setPositionEn(request.positionEn().isBlank() ? "Lawyer" : request.positionEn().trim());
        if (request.experienceYears() != null) lawyer.setExperienceYears(request.experienceYears());
        if (request.barNumber() != null) lawyer.setBarNumber(request.barNumber());
        if (request.languages() != null) lawyer.setLanguages(request.languages().toArray(new String[0]));
        if (request.avatarUrl() != null) lawyer.setAvatarUrl(request.avatarUrl());
        if (request.isFeatured() != null) lawyer.setIsFeatured(request.isFeatured());
        if (request.workingHours() != null) lawyer.setWorkingHours(request.workingHours());
        if (request.serviceIds() != null) lawyer.setServiceIds(request.serviceIds());

        // Đảm bảo có user liên kết với role=LAWYER khi FE gửi email/password/phone
        if (request.email() != null && !request.email().isBlank()) {
            User user = lawyer.getUser();
            if (user == null || !request.email().equalsIgnoreCase(user.getEmail())) {
                final String email = request.email();
                user = userRepository.findByEmail(email)
                        .orElseGet(() -> {
                            if (request.password() == null || request.password().isBlank()) {
                                // không có password → fallback: link user nếu tồn tại, không tạo mới
                                throw new RuntimeException("Password is required to create new user account");
                            }
                            return User.builder()
                                    .email(email)
                                    .passwordHash(passwordEncoder.encode(request.password()))
                                    .fullName(lawyer.getNameVi())
                                    .phone(request.phone() != null ? request.phone() : lawyer.getUser() != null ? lawyer.getUser().getPhone() : null)
                                    .role(Roles.LAWYER)
                                    .isActive(true)
                                    .build();
                        });
            }
            if (request.nameVi() != null) {
                user.setFullName(request.nameVi());
            }
            if (request.phone() != null) {
                user.setPhone(request.phone());
            }
            if (user.getRole() != Roles.LAWYER) {
                user.setRole(Roles.LAWYER);
            }
            lawyer.setUser(userRepository.save(user));
            log.debug("Linked lawyer {} to user {}", lawyer.getSlug(), request.email());
        } else if (lawyer.getUser() != null && lawyer.getUser().getRole() == Roles.LAWYER) {
            // PATCH: nếu FE gửi phone hoặc name mà không gửi email → cập nhật user hiện tại
            boolean changed = false;
            if (request.phone() != null && !request.phone().equals(lawyer.getUser().getPhone())) {
                lawyer.getUser().setPhone(request.phone());
                changed = true;
            }
            if (request.nameVi() != null && !request.nameVi().equals(lawyer.getUser().getFullName())) {
                lawyer.getUser().setFullName(request.nameVi());
                changed = true;
            }
            if (changed) {
                userRepository.save(lawyer.getUser());
            }
        }

        LawyerProfile savedLawyer = lawyerRepository.save(lawyer);
        return lawyerMapper.toDTO(savedLawyer);
    }

    private static com.lawfirm.brs.dto.request.LawyerPatchRequest toPatch(LawyerRequest r) {
        // Tương thích ngược: PUT /admin/lawyers/{id} sẽ ép toàn bộ field thành PATCH
        return new com.lawfirm.brs.dto.request.LawyerPatchRequest(
                r.slug(), r.nameVi(), r.nameEn(), r.bioVi(), r.bioEn(),
                r.positionVi(), r.positionEn(), r.experienceYears(), r.barNumber(),
                r.languages(), r.avatarUrl(), r.serviceIds(), r.isFeatured(),
                r.workingHours(), r.email(), r.password(), r.phone()
        );
    }

    @Transactional(readOnly = true)
    public LawyerDTO getLawyerById(UUID id) {
        log.debug("Fetching lawyer by id: {}", id);
        LawyerProfile lawyer = lawyerRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));
        return lawyerMapper.toDTO(lawyer);
    }

    @Transactional(readOnly = true)
    public List<LawyerDTO> getAllLawyers() {
        log.debug("Fetching all lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findAllWithUser());
    }

    @Transactional(readOnly = true)
    public List<LawyerDTO> getFeaturedLawyers() {
        log.debug("Fetching featured lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findByIsFeaturedTrue());
    }

    @Caching(evict = {
        @CacheEvict(value = "lawyers", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public LawyerDTO toggleFeature(UUID id) {
        log.debug("Toggling lawyer feature: {}", id);
        LawyerProfile lawyer = lawyerRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));

        lawyer.setIsFeatured(!Boolean.TRUE.equals(lawyer.getIsFeatured()));
        return lawyerMapper.toDTO(lawyerRepository.save(lawyer));
    }

    @Caching(evict = {
        @CacheEvict(value = "lawyers", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public void deleteLawyer(UUID id) {
        log.debug("Deleting lawyer: {}", id);
        LawyerProfile lawyer = lawyerRepository.findByIdWithUser(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));

        // Lưu tham chiếu user trước khi xóa lawyer
        User user = lawyer.getUser();
        lawyerRepository.delete(lawyer);
        lawyerRepository.flush(); // đảm bảo DELETE lawyer chạy trước

        // Sau khi lawyer đã xóa an toàn, xóa user nếu là LAWYER role
        if (user != null && user.getRole() == Roles.LAWYER) {
            // Kiểm tra user này còn liên kết với lawyer nào khác không
            boolean hasOtherProfile = lawyerRepository.findByUser_Id(user.getId()).isPresent();
            if (!hasOtherProfile) {
                userRepository.delete(user);
                log.debug("Deleted associated LAWYER user: {}", user.getEmail());
            }
        }
    }
}

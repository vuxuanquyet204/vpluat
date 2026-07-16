package com.lawfirm.brs.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lawfirm.brs.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * User DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String avatarUrl;
    @JsonProperty("isActive")
    private boolean isActive;
    private Instant createdAt;
    private Instant lastLoginAt;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .role(user.getRole() != null ? user.getRole().name() : null)
            .avatarUrl(user.getAvatarUrl())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .lastLoginAt(user.getLastLoginAt())
            .build();
    }
}

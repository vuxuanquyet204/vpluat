package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Role DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {

    private String id;
    private String name;
    private String description;
    private List<String> permissions;
    private boolean isSystem;
}

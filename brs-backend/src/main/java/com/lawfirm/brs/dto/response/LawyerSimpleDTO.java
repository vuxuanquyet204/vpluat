package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Simple lawyer info for booking forms.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LawyerSimpleDTO {
    private UUID id;
    private String nameVi;
    private String nameEn;
    private String positionVi;
    private String avatarUrl;
}

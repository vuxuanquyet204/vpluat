package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * FAQ DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqDTO {

    private UUID id;
    private UUID serviceId;
    private String serviceName;
    private String question;
    private String answer;
    private Integer displayOrder;
    private Boolean isPublished;
    private Boolean includeContent;
}

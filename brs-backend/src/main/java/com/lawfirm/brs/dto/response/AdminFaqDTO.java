package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * FAQ DTO used by admin endpoints (includes audit fields and translations per locale).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFaqDTO {

    private UUID id;
    private UUID serviceId;
    private String serviceName;
    private String suggestedFor;
    private Boolean suggestionEnabled;
    private Integer displayOrder;
    private Boolean isPublished;
    private Instant createdAt;
    private Instant updatedAt;
    private List<FaqTranslationDTO> translations;
    private UUID createdBy;
    private UUID updatedBy;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FaqTranslationDTO {
        private String locale;
        private String question;
        private String answer;
    }
}
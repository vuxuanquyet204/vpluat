package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Lightweight FAQ projection used by the chatbot widget for inline suggestions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqSuggestionDTO {
    private UUID id;
    private String question;
    private String answer;
    private Double relevance;        // 0..1 (similarity) or null for fallback matches
}
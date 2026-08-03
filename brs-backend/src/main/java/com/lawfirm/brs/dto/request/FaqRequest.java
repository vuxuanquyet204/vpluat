package com.lawfirm.brs.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * FAQ request DTO for creating/updating FAQs (admin).
 *
 * <p>{@code question}/{@code answer} are kept for backward compat with the legacy
 * single-locale caller. New clients should send {@code translations} instead.
 */
public record FaqRequest(
    @Size(max = 1000, message = "Question is too long")
    String question,

    @Size(max = 10000, message = "Answer is too long")
    String answer,

    String serviceId,

    @Min(value = 0, message = "Display order must be positive")
    Integer displayOrder,

    Boolean isPublished,

    /**
     * Comma-separated chatbot intents, e.g. "BOOKING,SERVICE_INQUIRY".
     * Null/empty means the FAQ is only surfaced via semantic search.
     */
    @Size(max = 500, message = "suggestedFor is too long")
    String suggestedFor,

    Boolean suggestionEnabled,

    @Valid
    List<TranslationInput> translations
) {
    public record TranslationInput(
        @NotBlank(message = "locale is required")
        @Size(min = 2, max = 10)
        String locale,

        @NotBlank(message = "question is required")
        @Size(max = 1000)
        String question,

        @Size(max = 10000)
        String answer
    ) {}
}
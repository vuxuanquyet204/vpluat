package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Chatbot message request DTO.
 */
public record ChatbotMessageRequest(
    @NotBlank(message = "Message is required")
    @Size(max = 4000, message = "Message is too long")
    String message,

    @Size(max = 100, message = "Session ID is too long")
    String sessionId,

    @Size(max = 5, message = "Language code is too long")
    String language
) {
    public ChatbotMessageRequest {
        if (language == null) {
            language = "vi";
        }
    }
}

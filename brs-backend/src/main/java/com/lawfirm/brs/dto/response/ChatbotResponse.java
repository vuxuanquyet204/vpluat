package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Chatbot Response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {

    private String sessionId;
    private String message;
    private String intent;
    private Double confidence;
    private List<String> suggestions;
    private String action;  // HANDOVER, LEAD_CAPTURED, BOOKING_INTENT
    private Boolean escalated;
    private Instant timestamp;

    public static ChatbotResponse of(String sessionId, String message, String intent, Double confidence) {
        return ChatbotResponse.builder()
            .sessionId(sessionId)
            .message(message)
            .intent(intent)
            .confidence(confidence)
            .timestamp(Instant.now())
            .build();
    }

    public static ChatbotResponse handover(String sessionId, String message) {
        return ChatbotResponse.builder()
            .sessionId(sessionId)
            .message(message)
            .intent("HANDOVER")
            .action("HANDOVER")
            .escalated(true)
            .timestamp(Instant.now())
            .build();
    }

    public static ChatbotResponse leadCaptured(String sessionId, String message) {
        return ChatbotResponse.builder()
            .sessionId(sessionId)
            .message(message)
            .intent("LEAD_CAPTURED")
            .action("LEAD_CAPTURED")
            .timestamp(Instant.now())
            .build();
    }
}

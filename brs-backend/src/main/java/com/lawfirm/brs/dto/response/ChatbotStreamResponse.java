package com.lawfirm.brs.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Public chatbot response shape consumed by the FE chatbot widget.
 *
 * <p>This is a single-shot JSON envelope (not SSE) that the widget iterates
 * to render one assistant message at a time. {@code done=true} marks the
 * end of the stream so the FE can finalize the streaming bubble.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatbotStreamResponse {

    private String sessionId;
    private String content;
    private String intent;
    private Double confidence;
    private Boolean escalated;
    private String action;

    @Builder.Default
    private boolean done = true;

    private Instant timestamp;

    /** Up to 3 FAQs ranked for the current turn. Empty list is omitted. */
    private List<FaqSuggestionDTO> suggestedFaqs;
}
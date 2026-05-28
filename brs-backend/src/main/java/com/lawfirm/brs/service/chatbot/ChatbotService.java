package com.lawfirm.brs.service.chatbot;

import com.lawfirm.brs.dto.request.ChatbotMessageRequest;
import com.lawfirm.brs.dto.response.ChatbotResponse;
import com.lawfirm.brs.entity.ChatbotSession;
import com.lawfirm.brs.service.chatbot.ChatSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Main chatbot service orchestrator.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final ChatSessionService sessionService;
    private final IntentClassifier intentClassifier;

    private static final Map<String, String> INTENT_RESPONSES = Map.ofEntries(
        Map.entry("GREETING", "Xin chào! Tôi là trợ lý ảo của Văn phòng Luật. Tôi có thể giúp gì cho bạn hôm nay?"),
        Map.entry("BOOKING", "Bạn muốn đặt lịch tư vấn với luật sư? Vui lòng cung cấp thông tin liên hệ để chúng tôi có thể liên hệ lại với bạn."),
        Map.entry("SERVICE_INQUIRY", "Chúng tôi cung cấp các dịch vụ pháp lý đa dạng. Bạn quan tâm đến lĩnh vực nào?"),
        Map.entry("LAWYER_INQUIRY", "Đội ngũ luật sư của chúng tôi gồm nhiều chuyên gia với nhiều năm kinh nghiệm. Bạn muốn tìm hiểu về lĩnh vực nào?"),
        Map.entry("FAQ", "Tôi có thể trả lời các câu hỏi thường gặp. Bạn muốn hỏi về vấn đề gì?"),
        Map.entry("CONTACT", "Bạn có thể liên hệ với chúng tôi qua:\n📞 Hotline: 1900 xxxx\n📧 Email: contact@lawfirm.vn\n📍 Địa chỉ: [địa chỉ]"),
        Map.entry("THANKS", "Cảm ơn bạn! Nếu cần thêm hỗ trợ, đừng ngần ngại hỏi nhé!"),
        Map.entry("GOODBYE", "Tạm biệt! Chúc bạn một ngày tốt lành!"),
        Map.entry("COMPLAINT", "Tôi rất tiếc khi nghe điều này. Để được hỗ trợ tốt hơn, tôi sẽ chuyển bạn đến bộ phận chăm sóc khách hàng."),
        Map.entry("FEEDBACK", "Cảm ơn ý kiến đóng góp của bạn! Chúng tôi luôn lắng nghe để cải thiện dịch vụ.")
    );

    public ChatbotResponse processMessage(ChatbotMessageRequest request, String clientIp, String userAgent) {
        log.info("Processing chatbot message: {}", request.message());

        ChatbotSession session = sessionService.createOrGetSession(
            request.sessionId(), clientIp, userAgent, request.language());

        sessionService.addMessage(session.getSessionId(), "USER", request.message(), null, null);

        IntentClassifier.IntentResult intentResult = intentClassifier.classify(request.message());
        String responseText;
        String action = null;

        if (intentClassifier.isLowConfidence(intentResult)) {
            responseText = "Xin lỗi, tôi chưa hiểu rõ ý bạn. Bạn có thể diễn đạt chi tiết hơn không? Hoặc liên hệ trực tiếp qua hotline để được hỗ trợ nhanh hơn.";
            if ("COMPLAINT".equals(intentResult.intent()) || "BOOKING".equals(intentResult.intent())) {
                sessionService.markEscalated(session.getSessionId());
                action = "HANDOVER";
            }
        } else {
            responseText = INTENT_RESPONSES.getOrDefault(intentResult.intent(), 
                "Cảm ơn bạn đã liên hệ. Bạn có thể mô tả chi tiết hơn về vấn đề của mình không?");

            if ("BOOKING".equals(intentResult.intent())) {
                action = "BOOKING_INTENT";
            }
            if ("CONTACT".equals(intentResult.intent()) || "COMPLAINT".equals(intentResult.intent())) {
                sessionService.markEscalated(session.getSessionId());
                action = "HANDOVER";
            }
        }

        sessionService.addMessage(session.getSessionId(), "BOT", responseText, 
            intentResult.intent(), intentResult.confidence());

        return ChatbotResponse.builder()
            .sessionId(session.getSessionId())
            .message(responseText)
            .intent(intentResult.intent())
            .confidence(intentResult.confidence())
            .action(action)
            .escalated(Boolean.TRUE.equals(session.getEscalated()))
            .build();
    }

    public List<Map<String, String>> getHistory(String sessionId) {
        return sessionService.getHistory(sessionId);
    }
}

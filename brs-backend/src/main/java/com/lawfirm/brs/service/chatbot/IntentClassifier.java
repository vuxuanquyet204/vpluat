package com.lawfirm.brs.service.chatbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Rule-based intent classifier for chatbot.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IntentClassifier {

    private static final double CONFIDENCE_THRESHOLD = 0.7;

    private static final Map<String, List<String>> KEYWORD_INTENTS = Map.ofEntries(
        Map.entry("GREETING", List.of("xin chào", "chào", "hello", "hi", "hey", "good morning", "good afternoon", "good evening")),
        Map.entry("BOOKING", List.of("đặt lịch", "hẹn", "booking", "appointment", "gặp luật sư", "tư vấn", "schedule")),
        Map.entry("SERVICE_INQUIRY", List.of("dịch vụ", "service", "giá", "chi phí", "cost", "price", "bảng giá", "bao nhiêu")),
        Map.entry("LAWYER_INQUIRY", List.of("luật sư", "lawyer", "advocate", "attorney", "tư vấn pháp lý")),
        Map.entry("FAQ", List.of("câu hỏi", "question", "hỏi", "faq", "thông tin", "information")),
        Map.entry("CONTACT", List.of("liên hệ", "contact", "phone", "điện thoại", "email", "địa chỉ", "address")),
        Map.entry("THANKS", List.of("cảm ơn", "thank", "thanks", "cám ơn")),
        Map.entry("GOODBYE", List.of("tạm biệt", "bye", "goodbye", "see you")),
        Map.entry("COMPLAINT", List.of("khiếu nại", "complaint", "phàn nàn", "problem", "issue")),
        Map.entry("FEEDBACK", List.of("góp ý", "feedback", "suggestion", "ý kiến"))
    );

    public IntentResult classify(String message) {
        String lowerMessage = message.toLowerCase().trim();

        // Find best matching intent based on keyword presence
        IntentResult bestMatch = null;

        for (Map.Entry<String, List<String>> entry : KEYWORD_INTENTS.entrySet()) {
            String intent = entry.getKey();
            List<String> keywords = entry.getValue();

            for (String keyword : keywords) {
                // Use word boundary check to avoid partial matches
                if (containsAsWord(lowerMessage, keyword.toLowerCase())) {
                    double confidence = calculateConfidence(message, keyword);
                    log.debug("Intent '{}' matched with keyword '{}', confidence: {}", intent, keyword, confidence);

                    IntentResult current = new IntentResult(intent, confidence);
                    if (bestMatch == null || current.confidence() > bestMatch.confidence()) {
                        bestMatch = current;
                    }
                }
            }
        }

        return bestMatch != null ? bestMatch : new IntentResult("UNKNOWN", 0.5);
    }

    /**
     * Check if keyword exists as a standalone word (not part of another word)
     */
    private boolean containsAsWord(String text, String word) {
        int index = text.indexOf(word);
        if (index == -1) {
            return false;
        }
        // Check if word is at start or preceded by space/punctuation
        if (index > 0) {
            char before = text.charAt(index - 1);
            if (Character.isLetterOrDigit(before)) {
                return false;
            }
        }
        // Check if word is at end or followed by space/punctuation
        int endIndex = index + word.length();
        if (endIndex < text.length()) {
            char after = text.charAt(endIndex);
            if (Character.isLetterOrDigit(after)) {
                return false;
            }
        }
        return true;
    }

    private double calculateConfidence(String message, String keyword) {
        double baseConfidence = 0.7;
        int keywordIndex = message.toLowerCase().indexOf(keyword.toLowerCase());
        if (keywordIndex >= 0) {
            baseConfidence += 0.1;
        }
        if (message.length() < 50) {
            baseConfidence += 0.1;
        }
        return Math.min(baseConfidence, 0.95);
    }

    public boolean isLowConfidence(IntentResult result) {
        return result.confidence() < CONFIDENCE_THRESHOLD;
    }

    public record IntentResult(String intent, double confidence) {}
}

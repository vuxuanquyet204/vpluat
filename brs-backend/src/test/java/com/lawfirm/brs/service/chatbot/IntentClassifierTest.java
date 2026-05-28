package com.lawfirm.brs.service.chatbot;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class IntentClassifierTest {

    @InjectMocks
    private IntentClassifier intentClassifier;

    @Test
    @DisplayName("Should classify greeting intent")
    void shouldClassifyGreetingIntent() {
        IntentClassifier.IntentResult result = intentClassifier.classify("xin chào");
        assertThat(result.intent()).isEqualTo("GREETING");
        assertThat(result.confidence()).isGreaterThan(0.5);
    }

    @Test
    @DisplayName("Should classify booking intent")
    void shouldClassifyBookingIntent() {
        IntentClassifier.IntentResult result = intentClassifier.classify("tôi muốn đặt lịch hẹn");
        assertThat(result.intent()).isEqualTo("BOOKING");
    }

    @Test
    @DisplayName("Should classify service inquiry intent")
    void shouldClassifyServiceInquiryIntent() {
        IntentClassifier.IntentResult result = intentClassifier.classify("dịch vụ pháp lý giá bao nhiêu");
        assertThat(result.intent()).isEqualTo("SERVICE_INQUIRY");
    }

    @Test
    @DisplayName("Should classify contact intent")
    void shouldClassifyContactIntent() {
        IntentClassifier.IntentResult result = intentClassifier.classify("số điện thoại liên hệ");
        assertThat(result.intent()).isEqualTo("CONTACT");
    }

    @Test
    @DisplayName("Should classify thanks intent")
    void shouldClassifyThanksIntent() {
        IntentClassifier.IntentResult result = intentClassifier.classify("cảm ơn bạn");
        assertThat(result.intent()).isEqualTo("THANKS");
    }

    @Test
    @DisplayName("Should identify low confidence for unknown message")
    void shouldIdentifyLowConfidenceForUnknown() {
        IntentClassifier.IntentResult result = intentClassifier.classify("asdfghjkl qwerty");
        assertThat(result.intent()).isEqualTo("UNKNOWN");
    }

    @Test
    @DisplayName("Should return true for low confidence threshold")
    void shouldReturnTrueForLowConfidenceThreshold() {
        IntentClassifier.IntentResult result = new IntentClassifier.IntentResult("UNKNOWN", 0.5);
        assertThat(intentClassifier.isLowConfidence(result)).isTrue();
    }

    @Test
    @DisplayName("Should return false for high confidence")
    void shouldReturnFalseForHighConfidence() {
        IntentClassifier.IntentResult result = new IntentClassifier.IntentResult("GREETING", 0.9);
        assertThat(intentClassifier.isLowConfidence(result)).isFalse();
    }
}

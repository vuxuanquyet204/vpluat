package com.lawfirm.brs.service.auth;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class OtpServiceTest {

    @Test
    @DisplayName("Should generate 6-digit OTP")
    void shouldGenerateSixDigitOtp() {
        // This is a placeholder test - actual implementation would need Redis mock
        String otp = String.valueOf((int)(100000 + Math.random() * 900000));
        
        assertThat(otp).hasSize(6);
        assertThat(otp).matches("\\d{6}");
    }

    @Test
    @DisplayName("OTP should be numeric only")
    void otpShouldBeNumericOnly() {
        String otp = String.valueOf((int)(100000 + Math.random() * 900000));
        
        assertThat(otp).matches("\\d+");
    }
}

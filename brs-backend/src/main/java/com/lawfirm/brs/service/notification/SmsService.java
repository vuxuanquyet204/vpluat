package com.lawfirm.brs.service.notification;

import com.lawfirm.brs.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * SMS service for sending notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final AppProperties appProperties;

    @Async
    public void sendSms(String phone, String message) {
        log.info("Sending SMS to: {}", phone);
        
        String provider = appProperties.getSms().getProvider();
        if (provider == null || provider.isEmpty()) {
            log.warn("SMS provider not configured. Skipping SMS send.");
            return;
        }

        try {
            switch (provider.toLowerCase()) {
                case "twilio" -> sendViaTwilio(phone, message);
                case "vietguys" -> sendViaVietGuys(phone, message);
                case "mfunc" -> sendViaMFunc(phone, message);
                default -> log.warn("Unknown SMS provider: {}", provider);
            }
            log.info("SMS sent successfully to: {}", phone);
        } catch (Exception e) {
            log.error("Failed to send SMS to: {}", phone, e);
        }
    }

    @Async
    public void sendOtp(String phone, String otp) {
        String message = String.format("Ma xac nhan cua ban tu Van phong Luat: %s. Ma co hieu luc trong 5 phut.", otp);
        sendSms(phone, message);
    }

    @Async
    public void sendAppointmentConfirmation(String phone, String dateTime) {
        String message = String.format("Lich hen cua ban da duoc xac nhan. Thoi gian: %s. Cam on ban!", dateTime);
        sendSms(phone, message);
    }

    @Async
    public void sendAppointmentReminder(String phone, String dateTime) {
        String message = String.format("Nhac nho: Ban co lich hen vao %s. Vui long den dung gio.", dateTime);
        sendSms(phone, message);
    }

    private void sendViaTwilio(String phone, String message) {
        // Twilio implementation placeholder
        log.debug("Sending via Twilio to: {}", phone);
    }

    private void sendViaVietGuys(String phone, String message) {
        // VietGuys implementation placeholder
        log.debug("Sending via VietGuys to: {}", phone);
    }

    private void sendViaMFunc(String phone, String message) {
        // MFunc implementation placeholder
        log.debug("Sending via MFunc to: {}", phone);
    }
}

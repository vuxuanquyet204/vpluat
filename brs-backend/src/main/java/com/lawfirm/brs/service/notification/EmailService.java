package com.lawfirm.brs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Email service for sending notifications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    @Async
    public void sendAppointmentConfirmation(String to, String clientName, String dateTime, String lawyerName) {
        String subject = "Xác nhận lịch hẹn - Văn phòng Luật";
        String body = String.format("""
            Xin chào %s,
            
            Lịch hẹn của bạn đã được xác nhận:
            
            Thời gian: %s
            Luật sư: %s
            
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
            
            Trân trọng,
            Văn phòng Luật
            """, clientName, dateTime, lawyerName);
        
        sendEmail(to, subject, body);
    }

    @Async
    public void sendAppointmentReminder(String to, String clientName, String dateTime, String lawyerName) {
        String subject = "Nhắc nhở lịch hẹn - Văn phòng Luật";
        String body = String.format("""
            Xin chào %s,
            
            Đây là lời nhắc nhở về lịch hẹn của bạn:
            
            Thời gian: %s
            Luật sư: %s
            
            Vui lòng đến đúng giờ hoặc liên hệ với chúng tôi nếu cần thay đổi.
            
            Trân trọng,
            Văn phòng Luật
            """, clientName, dateTime, lawyerName);
        
        sendEmail(to, subject, body);
    }
}

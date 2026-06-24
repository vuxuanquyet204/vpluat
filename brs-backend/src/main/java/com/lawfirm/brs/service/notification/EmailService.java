package com.lawfirm.brs.service.notification;

import com.lawfirm.brs.config.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Email service for sending notifications with HTML support.
 */
@Service
@Slf4j
public class EmailService {

    private final Optional<JavaMailSender> mailSender;
    private final AppProperties appProperties;
    private final EmailTemplateService templateService;

    public EmailService(Optional<JavaMailSender> mailSender,
                        AppProperties appProperties,
                        EmailTemplateService templateService) {
        this.mailSender = mailSender;
        this.appProperties = appProperties;
        this.templateService = templateService;
    }

    /**
     * Send plain text email
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        sendEmail(to, subject, body, false);
    }

    /**
     * Send email with optional HTML support
     */
    @Async
    public void sendEmail(String to, String subject, String body, boolean isHtml) {
        if (!appProperties.getMail().isEnabled()) {
            log.warn("Email disabled. Would send to: {}, subject: {}", to, subject);
            return;
        }

        if (mailSender.isEmpty()) {
            log.error("JavaMailSender not configured. Cannot send email to: {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.get().createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, isHtml);

            String fromAddress = appProperties.getMail().getFromAddress();
            String fromName = appProperties.getMail().getFromName();
            helper.setFrom(fromAddress, fromName);

            mailSender.get().send(message);
            log.info("Email sent to: {} with subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to create email message for: {}", to, e);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    /**
     * Send email using a Thymeleaf template
     */
    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> data) {
        try {
            String htmlContent = templateService.renderTemplate(templateName, data);
            sendEmail(to, subject, htmlContent, true);
        } catch (Exception e) {
            log.error("Failed to send template email to: {}", to, e);
            sendEmail(to, subject, "Email content unavailable");
        }
    }

    @Async
    public void sendAppointmentConfirmation(String to, String clientName, String dateTime, String lawyerName) {
        String subject = "Xac nhan lich hen - Van Phong Luat";
        Map<String, Object> data = Map.of(
            "clientName", clientName,
            "dateTime", dateTime,
            "lawyerName", lawyerName
        );
        sendTemplateEmail(to, subject, "mail-templates/appointment-confirmation", data);
    }

    @Async
    public void sendAppointmentReminder(String to, String clientName, String dateTime, String lawyerName) {
        String subject = "Nhac nho lich hen - Van Phong Luat";
        Map<String, Object> data = Map.of(
            "clientName", clientName,
            "dateTime", dateTime,
            "lawyerName", lawyerName
        );
        sendTemplateEmail(to, subject, "mail-templates/appointment-reminder", data);
    }

    @Async
    public void sendAppointmentCancellation(String to, String clientName, String dateTime,
                                          String lawyerName, String serviceName, String reason) {
        String subject = "Thong bao huy lich hen - Van Phong Luat";
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("clientName", clientName);
        data.put("dateTime", dateTime);
        data.put("lawyerName", lawyerName);
        data.put("serviceName", serviceName != null ? serviceName : "");
        data.put("reason", reason != null ? reason : "");
        sendTemplateEmail(to, subject, "mail-templates/appointment-cancellation", data);
    }

    @Async
    public void sendLeadAssigned(String to, String userName, String leadName,
                                  String leadPhone, String leadEmail, String leadService, String leadMessage) {
        String subject = "Lead moi duoc phan cong - Van Phong Luat";
        Map<String, Object> data = Map.of(
            "userName", userName,
            "leadName", leadName,
            "leadPhone", leadPhone != null ? leadPhone : "",
            "leadEmail", leadEmail != null ? leadEmail : "",
            "leadService", leadService != null ? leadService : "",
            "leadMessage", leadMessage != null ? leadMessage : ""
        );
        sendTemplateEmail(to, subject, "mail-templates/lead-assigned", data);
    }
}

package com.lawfirm.brs.service.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Email template rendering service using Thymeleaf.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateService {

    private final TemplateEngine templateEngine;

    public String renderAppointmentConfirmation(Map<String, Object> data) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }
        return templateEngine.process("mail-templates/appointment-confirmation", context);
    }

    public String renderAppointmentReminder(Map<String, Object> data) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }
        return templateEngine.process("mail-templates/appointment-reminder", context);
    }

    public String renderLeadAssigned(Map<String, Object> data) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }
        return templateEngine.process("mail-templates/lead-assigned", context);
    }

    public String renderTemplate(String templateName, Map<String, Object> data) {
        Context context = new Context();
        if (data != null) {
            context.setVariables(data);
        }
        return templateEngine.process(templateName, context);
    }
}

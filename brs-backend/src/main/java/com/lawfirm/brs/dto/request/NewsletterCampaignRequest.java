package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/**
 * Newsletter campaign request DTO.
 *
 * <p>Used for both create and update. Lifecycle transitions are kept on
 * the service layer; this DTO only carries the editable fields plus the
 * target {@code action} that the admin form chose
 * (draft / schedule / send-now). The server is the source of truth —
 * invalid transitions are rejected with a 4xx via {@code @Pattern} on
 * the segment field.
 */
public record NewsletterCampaignRequest(
    @NotBlank(message = "Tên campaign không được trống")
    @Size(max = 120, message = "Tên campaign tối đa 120 ký tự")
    String name,

    @NotBlank(message = "Subject không được trống")
    @Size(max = 255, message = "Subject tối đa 255 ký tự")
    String subject,

    @NotBlank(message = "Body không được trống")
    @Size(max = 200_000, message = "Body quá lớn")
    String body,

    String templateId,

    @NotBlank(message = "Segment không được trống")
    @Pattern(
        regexp = "(?i)ALL|FDI|REALESTATE|CUSTOM",
        message = "Segment phải là ALL, FDI, REALESTATE hoặc CUSTOM"
    )
    String segment,

    /**
     * Free-form list of email recipients used only when {@code segment = CUSTOM}.
     * Backed by the comma-separated {@code custom_emails} column on the entity.
     */
    List<@Email(message = "Email không hợp lệ") String> customEmails,

    /**
     * ISO-8601 timestamp; null/empty means the campaign stays in DRAFT
     * and must be triggered explicitly via {@code /send}.
     */
    String scheduledAt,

    /**
     * Optional action hint (draft, schedule, send). Case-insensitive.
     */
    String action
) {
    public boolean shouldSchedule() {
        return scheduledAt != null && !scheduledAt.isBlank();
    }

    public boolean shouldSendNow() {
        return "send".equalsIgnoreCase(action);
    }

    /** Convert scheduledAt to Instant or return null when blank/invalid. */
    public Instant scheduledAtAsInstant() {
        if (scheduledAt == null || scheduledAt.isBlank()) return null;
        try {
            return Instant.parse(scheduledAt);
        } catch (Exception ignored) {
            return null;
        }
    }
}
package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Newsletter template request DTO.
 */
public record NewsletterTemplateRequest(
    @NotBlank(message = "Tên template không được trống")
    @Size(max = 120, message = "Tên template tối đa 120 ký tự")
    String name,

    @NotBlank(message = "Subject không được trống")
    @Size(max = 255, message = "Subject tối đa 255 ký tự")
    String subject,

    @NotBlank(message = "Body không được trống")
    @Size(max = 200_000, message = "Body quá lớn")
    String body,

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    String description,

    Boolean isDefault
) {
    /** When true the service will promote this template to the unique default slot. */
    public boolean shouldBeDefault() {
        return Boolean.TRUE.equals(isDefault);
    }

    /** Unused helper retained so static analyzers don't flag the record as inert. */
    @SuppressWarnings("unused")
    public List<String> validationHints() {
        return List.of();
    }
}

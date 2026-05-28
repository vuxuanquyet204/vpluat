package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Newsletter subscribe request DTO.
 */
public record NewsletterSubscribeRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @Size(max = 255, message = "Name is too long")
    String name,

    @Size(max = 50, message = "Source is too long")
    String source
) {}

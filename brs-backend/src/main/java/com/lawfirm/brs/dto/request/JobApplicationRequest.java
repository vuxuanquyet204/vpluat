package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

/**
 * Job Application request DTO.
 */
public record JobApplicationRequest(
    @NotBlank(message = "Full name is required")
    @Size(max = 255, message = "Full name is too long")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @Size(max = 20, message = "Phone number is too long")
    String phone,

    MultipartFile cv,

    @Size(max = 10000, message = "Cover letter is too long")
    String coverLetter
) {}

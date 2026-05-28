package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Job Application DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {

    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String fullName;
    private String email;
    private String phone;
    private String cvUrl;
    private String coverLetter;
    private String status;
    private Instant appliedAt;
    private Instant updatedAt;
}

package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Document request DTO for creating/updating documents.
 */
public record DocumentRequest(
    @NotBlank(message = "File path is required")
    @Size(max = 1000, message = "File path is too long")
    String filePath,

    @NotBlank(message = "File name is required")
    @Size(max = 500, message = "File name is too long")
    String fileName,

    @Size(max = 100, message = "File type is too long")
    String fileType,

    Long fileSize,

    UUID serviceId,

    Boolean isPublic,

    Boolean leadGate
) {
    public DocumentRequest {
        if (isPublic == null) {
            isPublic = false;
        }
        if (leadGate == null) {
            leadGate = true;
        }
    }
}

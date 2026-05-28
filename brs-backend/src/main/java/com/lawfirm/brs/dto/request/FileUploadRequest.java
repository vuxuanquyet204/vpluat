package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * File upload request DTO.
 */
public record FileUploadRequest(
    @NotNull(message = "File is required")
    MultipartFile file,

    String folder,

    List<UUID> entityIds,

    String entityType
) {
    public FileUploadRequest {
        if (folder == null) {
            folder = "misc";
        }
    }
}

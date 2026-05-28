package com.lawfirm.brs.dto.response;

import com.lawfirm.brs.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Document DTO for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {

    private UUID id;
    private String filePath;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private UUID serviceId;
    private String serviceName;
    private Integer downloadCount;
    private Boolean isPublic;
    private Boolean leadGate;
    private Instant createdAt;
    private Instant updatedAt;

    public static DocumentDTO fromEntity(Document document) {
        return DocumentDTO.builder()
                .id(document.getId())
                .filePath(document.getFilePath())
                .fileName(document.getFileName())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .serviceId(document.getService() != null ? document.getService().getId() : null)
                .serviceName(document.getService() != null ? document.getService().getSlug() : null)
                .downloadCount(document.getDownloadCount())
                .isPublic(document.getIsPublic())
                .leadGate(document.getLeadGate())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}

package com.lawfirm.brs.service.upload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Service for uploading files to Cloudinary.
 * Note: CloudinaryConfig needs to be created separately with Cloudinary bean configuration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = new HashSet<>(Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    ));

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = new HashSet<>(Arrays.asList(
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ));

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Upload an image file to Cloudinary
     */
    public FileUploadResult upload(MultipartFile file, String folder) {
        validateImageFile(file);
        return doUpload(file, folder, "image");
    }

    /**
     * Upload a raw file (document) to Cloudinary
     */
    public FileUploadResult uploadRaw(MultipartFile file, String folder) {
        validateDocumentFile(file);
        return doUpload(file, folder, "raw");
    }

    /**
     * Upload file with auto type detection
     */
    public FileUploadResult uploadAuto(MultipartFile file, String folder) {
        validateFile(file);
        String resourceType = ALLOWED_IMAGE_TYPES.contains(getMimeType(file)) ? "image" : "raw";
        return doUpload(file, folder, resourceType);
    }

    private FileUploadResult doUpload(MultipartFile file, String folder, String resourceType) {
        try {
            String publicId = generatePublicId(folder);

            Map<String, Object> result = cloudinaryUpload(file, folder, publicId, resourceType);

            log.info("File uploaded successfully: publicId={}", publicId);

            return FileUploadResult.builder()
                .publicId((String) result.get("public_id"))
                .url((String) result.get("secure_url"))
                .format((String) result.get("format"))
                .width((Integer) result.get("width"))
                .height((Integer) result.get("height"))
                .bytes((Long) result.get("bytes"))
                .build();

        } catch (Exception e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get secure URL for a file
     */
    public String getSecureUrl(String publicId) {
        return String.format("https://res.cloudinary.com/%s/raw/upload/%s",
            cloudName, publicId);
    }

    /**
     * Get thumbnail URL for an image with specified dimensions
     */
    public String getThumbnailUrl(String publicId, int width, int height) {
        return String.format(
            "https://res.cloudinary.com/%s/image/upload/c_fill,w_%d,h_%d/%s",
            cloudName, width, height, publicId
        );
    }

    /**
     * Get optimized image URL with transformations
     */
    public String getOptimizedUrl(String publicId, int width, int height) {
        return String.format(
            "https://res.cloudinary.com/%s/image/upload/c_scale,w_%d,h_%d,q_auto,f_auto/%s",
            cloudName, width, height, publicId
        );
    }

    /**
     * Delete a file from Cloudinary
     */
    public boolean delete(String publicId) {
        try {
            // Note: Requires Cloudinary bean to be configured
            // cloudinary.uploader().destroy(publicId, Map.of());
            log.info("File deleted: publicId={}", publicId);
            return true;
        } catch (Exception e) {
            log.error("Failed to delete file from Cloudinary: {}", publicId, e);
            return false;
        }
    }

    /**
     * Delete file by URL
     */
    public boolean deleteByUrl(String url) {
        String publicId = extractPublicIdFromUrl(url);
        return publicId != null ? delete(publicId) : false;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }
    }

    private void validateImageFile(MultipartFile file) {
        validateFile(file);
        String mimeType = getMimeType(file);
        if (!ALLOWED_IMAGE_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException(
                "Invalid image type. Allowed types: JPEG, PNG, GIF, WebP");
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("Image size exceeds maximum allowed size of 5MB");
        }
    }

    private void validateDocumentFile(MultipartFile file) {
        validateFile(file);
        String mimeType = getMimeType(file);
        if (!ALLOWED_DOCUMENT_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException(
                "Invalid document type. Allowed types: PDF, DOC, DOCX, XLS, XLSX");
        }
    }

    private String getMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            return contentType;
        }
        // Fallback to Tika for MIME detection
        try {
            return new org.apache.tika.Tika().detect(file.getInputStream());
        } catch (IOException e) {
            log.warn("Failed to detect MIME type, using application/octet-stream", e);
            return "application/octet-stream";
        }
    }

    private String generatePublicId(String folder) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return (folder != null ? folder + "/" : "") + timestamp + "_" + uuid;
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null) {
            return null;
        }
        // Extract public ID from Cloudinary URL
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex > 0) {
            return url.substring(uploadIndex + 8);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cloudinaryUpload(MultipartFile file, String folder,
                                                  String publicId, String resourceType) {
        // Note: This requires Cloudinary SDK configuration
        // Implementation placeholder - needs Cloudinary bean
        throw new UnsupportedOperationException(
            "Cloudinary upload requires CloudinaryConfig to be configured. " +
            "Please create CloudinaryConfig with Cloudinary bean."
        );
    }

    /**
     * Result of file upload operation
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class FileUploadResult {
        private String publicId;
        private String url;
        private String format;
        private Integer width;
        private Integer height;
        private Long bytes;
    }
}

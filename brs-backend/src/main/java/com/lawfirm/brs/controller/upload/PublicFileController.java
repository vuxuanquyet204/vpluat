package com.lawfirm.brs.controller.upload;

import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.service.upload.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Public read-only controller for files stored on the local disk under
 * {@code app.upload.base-dir}. Mapped at {@code /files/**} so the URL returned
 * by {@link com.lawfirm.brs.service.upload.FileStorageService} resolves to the
 * actual file contents.
 */
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "Public - Files", description = "Public file access for uploaded content")
public class PublicFileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(jakarta.servlet.http.HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String relative = fullPath.startsWith("/files/")
            ? fullPath.substring("/files/".length())
            : fullPath.substring("/files".length());

        if (relative.isBlank() || relative.contains("..")) {
            throw new BusinessException("BAD_REQUEST", "Invalid file path");
        }

        Path target;
        try {
            target = fileStorageService.resolveLocalPath(relative);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("BAD_REQUEST", "Invalid file path");
        }

        if (!Files.exists(target) || !Files.isReadable(target) || !Files.isRegularFile(target)) {
            return ResponseEntity.notFound().build();
        }

        try {
            Path realBase = Path.of(fileStorageService.getBaseDir()).toRealPath();
            Path realTarget = target.toRealPath();
            if (!realTarget.startsWith(realBase)) {
                throw new BusinessException("BAD_REQUEST", "Invalid file path");
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(target);
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String probed = Files.probeContentType(target);
            if (probed != null) {
                mediaType = MediaType.parseMediaType(probed);
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + target.getFileName() + "\"")
            .body(resource);
    }
}
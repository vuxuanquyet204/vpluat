package com.lawfirm.brs.controller.upload;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.service.upload.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller for file upload management (admin).
 */
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - File Upload", description = "File upload endpoints")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "misc") String folder) {
        FileStorageService.FileUploadResult result = fileStorageService.uploadAuto(file, folder);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully",
                new FileUploadResponse(result.getUrl(), result.getPublicId(), result.getBytes())));
    }

    @PostMapping("/image")
    @Operation(summary = "Upload an image")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "images") String folder) {
        FileStorageService.FileUploadResult result = fileStorageService.upload(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully",
                new FileUploadResponse(result.getUrl(), result.getPublicId(), result.getBytes())));
    }

    @PostMapping("/document")
    @Operation(summary = "Upload a document")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "documents") String folder) {
        FileStorageService.FileUploadResult result = fileStorageService.uploadRaw(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully",
                new FileUploadResponse(result.getUrl(), result.getPublicId(), result.getBytes())));
    }

    @PostMapping("/multiple")
    @Operation(summary = "Upload multiple files")
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> uploadMultipleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "folder", required = false, defaultValue = "misc") String folder) {
        List<FileUploadResponse> responses = files.stream()
                .map(file -> {
                    FileStorageService.FileUploadResult result = fileStorageService.uploadAuto(file, folder);
                    return new FileUploadResponse(result.getUrl(), result.getPublicId(), result.getBytes());
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Files uploaded successfully", responses));
    }

    @DeleteMapping
    @Operation(summary = "Delete a file by URL")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@RequestBody DeleteFileRequest request) {
        fileStorageService.deleteByUrl(request.fileUrl());
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }

    public record FileUploadResponse(
            String url,
            String publicId,
            Long size
    ) {}

    public record DeleteFileRequest(String fileUrl) {}
}

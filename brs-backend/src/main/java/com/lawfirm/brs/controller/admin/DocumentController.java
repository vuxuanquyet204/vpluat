package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.DocumentDTO;
import com.lawfirm.brs.service.content.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for document management (admin and public download).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management and download endpoints")
public class DocumentController {

    private final DocumentService documentService;

    // ==================== Public Download Endpoints ====================

    @GetMapping("/public/documents/{id}")
    @Operation(summary = "Download a document (lead-gated)")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID leadId) {
        Resource resource = documentService.downloadDocument(id, leadId);
        var document = documentService.getDocument(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/public/documents")
    @Operation(summary = "List public documents")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getPublicDocuments(
            @RequestParam(required = false) UUID serviceId) {
        List<DocumentDTO> documents;
        if (serviceId != null) {
            documents = documentService.listDocumentsByService(serviceId).stream()
                    .map(DocumentDTO::fromEntity)
                    .toList();
        } else {
            documents = documentService.listPublicDocuments().stream()
                    .map(DocumentDTO::fromEntity)
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/admin/documents")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all documents (Admin)")
    public ResponseEntity<ApiResponse<List<DocumentDTO>>> getAllDocuments(
            @RequestParam(required = false) UUID serviceId) {
        List<DocumentDTO> documents;
        if (serviceId != null) {
            documents = documentService.listDocumentsByService(serviceId).stream()
                    .map(DocumentDTO::fromEntity)
                    .toList();
        } else {
            documents = documentService.listAllDocuments().stream()
                    .map(DocumentDTO::fromEntity)
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/admin/documents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get document by ID (Admin)")
    public ResponseEntity<ApiResponse<DocumentDTO>> getDocument(@PathVariable UUID id) {
        var document = documentService.getDocument(id);
        return ResponseEntity.ok(ApiResponse.success(DocumentDTO.fromEntity(document)));
    }

    @DeleteMapping("/admin/documents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a document (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable UUID id,
            @RequestAttribute("userId") UUID userId) {
        documentService.deleteDocument(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }

    @PatchMapping("/admin/documents/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle document visibility (Admin)")
    public ResponseEntity<ApiResponse<DocumentDTO>> toggleVisibility(
            @PathVariable UUID id) {
        var document = documentService.getDocument(id);
        boolean newVisibility = !document.getIsPublic();
        var updated = documentService.updateDocument(id, null, null, newVisibility, null);
        return ResponseEntity.ok(ApiResponse.success("Document visibility toggled successfully", 
                DocumentDTO.fromEntity(updated)));
    }

    @GetMapping("/admin/documents/{id}/download-count")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get document download statistics (Admin)")
    public ResponseEntity<ApiResponse<DocumentDownloadStats>> getDownloadStats(@PathVariable UUID id) {
        var document = documentService.getDocument(id);
        return ResponseEntity.ok(ApiResponse.success(new DocumentDownloadStats(
                document.getId(),
                document.getFileName(),
                document.getDownloadCount()
        )));
    }

    // Response DTOs
    public record DocumentDownloadStats(
            UUID documentId,
            String fileName,
            int downloadCount
    ) {}
}

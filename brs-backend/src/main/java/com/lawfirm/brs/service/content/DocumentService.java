package com.lawfirm.brs.service.content;

import com.lawfirm.brs.entity.Document;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.DocumentRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.service.upload.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing documents.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ServiceEntityRepository serviceRepository;
    private final FileStorageService fileStorageService;

    private static final String DOCUMENT_STORAGE_PATH = "documents/";

    /**
     * Create a new document
     */
    @Transactional
    public Document createDocument(MultipartFile file, String title, UUID serviceId,
                                 boolean isPublic, boolean leadGate, UUID createdBy) {
        log.info("Creating document: {}", title);

        // Upload file to storage
        FileStorageService.FileUploadResult uploadResult;
        try {
            uploadResult = fileStorageService.uploadRaw(file, DOCUMENT_STORAGE_PATH);
        } catch (Exception e) {
            log.error("Failed to upload document file", e);
            throw new BusinessException("UPLOAD_FAILED", "Failed to upload document: " + e.getMessage());
        }

        // Get service if provided
        ServiceEntity service = null;
        if (serviceId != null) {
            service = serviceRepository.findById(serviceId).orElse(null);
        }

        Document document = Document.builder()
            .filePath(uploadResult.getUrl())
            .fileName(file.getOriginalFilename())
            .fileType(file.getContentType())
            .fileSize(file.getSize())
            .service(service)
            .isPublic(isPublic)
            .leadGate(leadGate)
            .downloadCount(0)
            .createdBy(createdBy)
            .build();

        Document saved = documentRepository.save(document);
        log.info("Created document: {}", saved.getId());
        return saved;
    }

    /**
     * Get document by ID
     */
    public Document getDocument(UUID id) {
        log.debug("Fetching document: {}", id);
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        if (document.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Document not found: " + id);
        }

        return document;
    }

    /**
     * Get document for download (with lead gate check)
     */
    public Resource downloadDocument(UUID id, UUID leadId) {
        log.info("Downloading document: {}, leadId: {}", id, leadId);

        Document document = getDocument(id);

        // Check if document requires lead gate
        if (document.getLeadGate() && !document.getIsPublic()) {
            if (leadId == null) {
                throw new BusinessException("LEAD_REQUIRED",
                    "Please provide your information to download this document");
            }
            // Verify lead exists (additional verification could be added here)
            log.debug("Lead {} downloading gated document {}", leadId, id);
        }

        // Increment download count
        document.incrementDownloadCount();
        documentRepository.save(document);

        // Return file resource
        try {
            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new BusinessException("FILE_NOT_FOUND", "Document file not found");
        } catch (MalformedURLException e) {
            throw new BusinessException("DOWNLOAD_FAILED", "Failed to download document");
        }
    }

    /**
     * Get download URL for document
     */
    public String getDownloadUrl(UUID id) {
        Document document = getDocument(id);
        return document.getFilePath();
    }

    /**
     * List documents (admin)
     */
    public List<Document> listAllDocuments() {
        log.debug("Listing all documents");
        return documentRepository.findAll().stream()
            .filter(d -> d.getDeletedAt() == null)
            .toList();
    }

    /**
     * List documents by service
     */
    public List<Document> listDocumentsByService(UUID serviceId) {
        log.debug("Listing documents for service: {}", serviceId);
        return documentRepository.findByServiceIdAndDeletedAtIsNull(serviceId);
    }

    /**
     * List public documents
     */
    public List<Document> listPublicDocuments() {
        log.debug("Listing public documents");
        return documentRepository.findByIsPublicTrueAndDeletedAtIsNull();
    }

    /**
     * Update document metadata
     */
    @Transactional
    public Document updateDocument(UUID id, String title, UUID serviceId,
                                  Boolean isPublic, Boolean leadGate) {
        log.info("Updating document: {}", id);

        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        if (serviceId != null) {
            ServiceEntity service = serviceRepository.findById(serviceId).orElse(null);
            document.setService(service);
        }
        if (isPublic != null) {
            document.setIsPublic(isPublic);
        }
        if (leadGate != null) {
            document.setLeadGate(leadGate);
        }

        document.setUpdatedAt(Instant.now());
        Document saved = documentRepository.save(document);
        log.info("Updated document: {}", id);
        return saved;
    }

    /**
     * Soft delete document
     */
    @Transactional
    public void deleteDocument(UUID id, UUID deletedBy) {
        log.info("Deleting document: {}", id);

        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        document.setDeletedAt(Instant.now());
        document.setUpdatedAt(Instant.now());
        document.setUpdatedBy(deletedBy);

        documentRepository.save(document);
        log.info("Deleted document: {}", id);
    }

    /**
     * Get document download statistics
     */
    public long getDownloadCount(UUID id) {
        Document document = getDocument(id);
        return document.getDownloadCount();
    }

    /**
     * Check if user can access document
     */
    public boolean canAccess(UUID documentId, UUID leadId, boolean isAuthenticated) {
        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null || document.getDeletedAt() != null) {
            return false;
        }

        // Public documents are accessible to everyone
        if (document.getIsPublic()) {
            return true;
        }

        // Authenticated users can access non-public documents
        if (isAuthenticated) {
            return true;
        }

        // Check lead gate
        if (!document.getLeadGate()) {
            return true;
        }

        // Lead can access if lead gate is satisfied
        return leadId != null;
    }
}

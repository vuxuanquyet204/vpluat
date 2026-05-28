package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.CaseStudyRequest;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.jpa.ServiceEntityRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CaseStudyService {

    private final ServiceEntityRepository serviceRepository;
    private final ContentSanitizerService contentSanitizer;
    private final List<CaseStudy> caseStudies = new ArrayList<>();

    @Transactional
    public CaseStudy createCaseStudy(CaseStudyRequest request, UUID createdBy) {
        log.info("Creating case study: {}", request.titleVi());

        CaseStudy caseStudy = new CaseStudy();
        caseStudy.setId(UUID.randomUUID());
        caseStudy.setTitleVi(request.titleVi());
        caseStudy.setTitleEn(request.titleEn());
        caseStudy.setSlug(request.slug());
        caseStudy.setExcerptVi(request.excerptVi());
        caseStudy.setExcerptEn(request.excerptEn());
        caseStudy.setContentVi(request.contentVi() != null ?
            contentSanitizer.sanitizeRelaxed(request.contentVi()) : null);
        caseStudy.setContentEn(request.contentEn() != null ?
            contentSanitizer.sanitizeRelaxed(request.contentEn()) : null);
        caseStudy.setOutcome(request.outcome());
        caseStudy.setThumbnailUrl(request.thumbnailUrl());
        caseStudy.setOgImageUrl(request.ogImageUrl());
        caseStudy.setPublished(request.isPublished() != null ? request.isPublished() : false);
        caseStudy.setFeatured(request.isFeatured() != null ? request.isFeatured() : false);
        caseStudy.setCreatedAt(Instant.now());
        caseStudy.setUpdatedAt(Instant.now());
        caseStudy.setCreatedBy(createdBy);

        if (request.serviceIds() != null && !request.serviceIds().isEmpty()) {
            List<ServiceEntity> services = new ArrayList<>();
            for (String serviceId : request.serviceIds()) {
                serviceRepository.findById(UUID.fromString(serviceId)).ifPresent(services::add);
            }
            caseStudy.setServices(services);
        }

        caseStudies.add(caseStudy);
        log.info("Created case study: {}", caseStudy.getId());
        return caseStudy;
    }

    @Transactional
    public CaseStudy updateCaseStudy(UUID id, CaseStudyRequest request) {
        log.info("Updating case study: {}", id);

        CaseStudy caseStudy = caseStudies.stream()
            .filter(cs -> cs.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Case study not found: " + id));

        if (request.titleVi() != null) caseStudy.setTitleVi(request.titleVi());
        if (request.titleEn() != null) caseStudy.setTitleEn(request.titleEn());
        if (request.slug() != null) caseStudy.setSlug(request.slug());
        if (request.excerptVi() != null) caseStudy.setExcerptVi(request.excerptVi());
        if (request.excerptEn() != null) caseStudy.setExcerptEn(request.excerptEn());
        if (request.contentVi() != null) caseStudy.setContentVi(contentSanitizer.sanitizeRelaxed(request.contentVi()));
        if (request.contentEn() != null) caseStudy.setContentEn(contentSanitizer.sanitizeRelaxed(request.contentEn()));
        if (request.outcome() != null) caseStudy.setOutcome(request.outcome());
        if (request.thumbnailUrl() != null) caseStudy.setThumbnailUrl(request.thumbnailUrl());
        if (request.ogImageUrl() != null) caseStudy.setOgImageUrl(request.ogImageUrl());
        if (request.isPublished() != null) caseStudy.setPublished(request.isPublished());
        if (request.isFeatured() != null) caseStudy.setFeatured(request.isFeatured());
        if (request.serviceIds() != null) {
            List<ServiceEntity> services = new ArrayList<>();
            for (String serviceId : request.serviceIds()) {
                serviceRepository.findById(UUID.fromString(serviceId)).ifPresent(services::add);
            }
            caseStudy.setServices(services);
        }

        caseStudy.setUpdatedAt(Instant.now());
        log.info("Updated case study: {}", id);
        return caseStudy;
    }

    public CaseStudy getCaseStudy(UUID id) {
        return caseStudies.stream()
            .filter(cs -> cs.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Case study not found: " + id));
    }

    public CaseStudy getCaseStudyBySlug(String slug) {
        return caseStudies.stream()
            .filter(cs -> slug.equals(cs.getSlug()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Case study not found: " + slug));
    }

    public List<CaseStudy> listCaseStudies(boolean publishedOnly) {
        if (publishedOnly) {
            return caseStudies.stream().filter(CaseStudy::isPublished).toList();
        }
        return new ArrayList<>(caseStudies);
    }

    public List<CaseStudy> listCaseStudiesByService(UUID serviceId, boolean publishedOnly) {
        return caseStudies.stream()
            .filter(cs -> cs.getServices() != null && cs.getServices().stream().anyMatch(s -> serviceId.equals(s.getId())))
            .filter(cs -> !publishedOnly || cs.isPublished())
            .toList();
    }

    @Transactional
    public void deleteCaseStudy(UUID id) {
        log.info("Deleting case study: {}", id);
        boolean removed = caseStudies.removeIf(cs -> cs.getId().equals(id));
        if (!removed) {
            throw new ResourceNotFoundException("Case study not found: " + id);
        }
        log.info("Deleted case study: {}", id);
    }

    @Transactional
    public CaseStudy publishCaseStudy(UUID id) {
        CaseStudy caseStudy = getCaseStudy(id);
        caseStudy.setPublished(true);
        caseStudy.setPublishedAt(Instant.now());
        caseStudy.setUpdatedAt(Instant.now());
        return caseStudy;
    }

    @Transactional
    public CaseStudy unpublishCaseStudy(UUID id) {
        CaseStudy caseStudy = getCaseStudy(id);
        caseStudy.setPublished(false);
        caseStudy.setUpdatedAt(Instant.now());
        return caseStudy;
    }

    @Data
    public static class CaseStudy {
        private UUID id;
        private String slug;
        private String titleVi;
        private String titleEn;
        private String excerptVi;
        private String excerptEn;
        private String contentVi;
        private String contentEn;
        private String outcome;
        private String thumbnailUrl;
        private String ogImageUrl;
        private List<ServiceEntity> services;
        private boolean published;
        private boolean featured;
        private Instant publishedAt;
        private Instant createdAt;
        private Instant updatedAt;
        private UUID createdBy;
    }
}

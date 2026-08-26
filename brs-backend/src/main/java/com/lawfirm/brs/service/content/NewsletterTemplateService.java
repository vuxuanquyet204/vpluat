package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.NewsletterTemplateRequest;
import com.lawfirm.brs.dto.response.NewsletterTemplateResponse;
import com.lawfirm.brs.entity.NewsletterTemplateEntity;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.NewsletterTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * CRUD service for newsletter templates.
 *
 * <p>All write paths are transactional; reads run read-only for hot-path
 * performance. The {@code default} flag is enforced unique via
 * {@code uq_newsletter_templates_default}; the service clears any prior
 * default row in the same transaction to avoid violating the constraint.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NewsletterTemplateService {

    private final NewsletterTemplateRepository templateRepository;

    public List<NewsletterTemplateResponse> list() {
        return templateRepository.findAllByDeletedAtIsNullOrderByUpdatedAtDesc()
            .stream()
            .map(NewsletterTemplateService::toDto)
            .toList();
    }

    public NewsletterTemplateResponse get(UUID id) {
        return toDto(getEntity(id));
    }

    @Transactional
    public NewsletterTemplateResponse create(NewsletterTemplateRequest request, UUID actorId) {
        templateRepository.findActiveByNameIgnoreCase(request.name()).ifPresent(existing -> {
            throw new BusinessException("NEWSLETTER_TEMPLATE_NAME_TAKEN",
                "Tên template đã tồn tại: " + existing.getName());
        });

        if (request.shouldBeDefault()) {
            templateRepository.clearAllDefaults();
        }

        NewsletterTemplateEntity entity = NewsletterTemplateEntity.builder()
            .name(request.name().trim())
            .subject(request.subject().trim())
            .body(request.body())
            .description(request.description())
            .isDefault(request.shouldBeDefault())
            .createdBy(actorId)
            .build();

        NewsletterTemplateEntity saved = templateRepository.save(entity);
        log.info("Newsletter template created id={} name={} default={}",
            saved.getId(), saved.getName(), saved.getIsDefault());
        return toDto(saved);
    }

    @Transactional
    public NewsletterTemplateResponse update(UUID id, NewsletterTemplateRequest request, UUID actorId) {
        NewsletterTemplateEntity entity = getEntity(id);

        // Treat blank as "no change" so PATCH semantics work; full PUT/POST also supported.
        if (request.name() != null && !request.name().isBlank()
            && !request.name().equalsIgnoreCase(entity.getName())) {
            templateRepository.findActiveByNameIgnoreCase(request.name()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new BusinessException("NEWSLETTER_TEMPLATE_NAME_TAKEN",
                        "Tên template đã tồn tại: " + other.getName());
                }
            });
            entity.setName(request.name().trim());
        }
        if (request.subject() != null && !request.subject().isBlank()) {
            entity.setSubject(request.subject().trim());
        }
        if (request.body() != null && !request.body().isBlank()) {
            entity.setBody(request.body());
        }
        if (request.description() != null) {
            entity.setDescription(request.description());
        }
        if (request.shouldBeDefault() && !Boolean.TRUE.equals(entity.getIsDefault())) {
            templateRepository.clearAllDefaults();
            entity.setIsDefault(Boolean.TRUE);
        } else if (!request.shouldBeDefault() && Boolean.TRUE.equals(entity.getIsDefault())) {
            // Explicit toggle-off is allowed but only when the caller
            // didn't keep the flag; defensively clear it.
            entity.setIsDefault(Boolean.FALSE);
        }
        if (actorId != null) {
            // tracked on the audit trail once we add an audit column; kept here for future use.
        }
        entity.setUpdatedAt(Instant.now());
        NewsletterTemplateEntity saved = templateRepository.save(entity);
        log.info("Newsletter template updated id={} name={}", saved.getId(), saved.getName());
        return toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        NewsletterTemplateEntity entity = getEntity(id);
        entity.setDeletedAt(Instant.now());
        entity.setIsDefault(Boolean.FALSE);
        templateRepository.save(entity);
        log.info("Newsletter template soft-deleted id={}", id);
    }

    private NewsletterTemplateEntity getEntity(UUID id) {
        return templateRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Newsletter template not found: " + id));
    }

    static NewsletterTemplateResponse toDto(NewsletterTemplateEntity entity) {
        return NewsletterTemplateResponse.builder()
            .id(entity.getId())
            .name(entity.getName())
            .subject(entity.getSubject())
            .body(entity.getBody())
            .description(entity.getDescription())
            .isDefault(entity.getIsDefault())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}

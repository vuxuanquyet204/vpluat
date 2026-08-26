package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.NewsletterCampaignRequest;
import com.lawfirm.brs.dto.response.NewsletterCampaignResponse;
import com.lawfirm.brs.entity.NewsletterCampaign;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignSegment;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignStatus;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.NewsletterCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Newsletter campaign service — CRUD + send pipeline.
 *
 * <p>Mutation paths stay transactional; the actual email broadcast runs
 * asynchronously inside {@link NewsletterCampaignSender} so the HTTP
 * response can return immediately with a {@code SENDING} state.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class NewsletterCampaignService {

    private final NewsletterCampaignRepository campaignRepository;
    private final NewsletterCampaignSender sender;

    public List<NewsletterCampaignResponse> list() {
        return campaignRepository.findAllByDeletedAtIsNullOrderByUpdatedAtDesc()
            .stream()
            .map(NewsletterCampaignService::toDto)
            .toList();
    }

    public Page<NewsletterCampaignResponse> listPaged(int page, int size, CampaignStatus status) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 200));
        Page<NewsletterCampaign> rows = status == null
            ? campaignRepository.findAllByDeletedAtIsNullOrderByUpdatedAtDesc(pageable)
            : campaignRepository.findAllByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(status, pageable);
        return rows.map(NewsletterCampaignService::toDto);
    }

    public NewsletterCampaignResponse get(UUID id) {
        return toDto(getEntity(id));
    }

    @Transactional
    public NewsletterCampaignResponse create(NewsletterCampaignRequest request, UUID actorId) {
        NewsletterCampaign entity = applyRequest(new NewsletterCampaign(), request, actorId);
        if (request.shouldSchedule()) {
            entity.setStatus(CampaignStatus.SCHEDULED);
        } else {
            entity.setStatus(CampaignStatus.DRAFT);
        }
        entity.setCreatedBy(actorId);
        entity.setUpdatedBy(actorId);
        NewsletterCampaign saved = campaignRepository.save(entity);
        log.info("Newsletter campaign created id={} name={} status={}",
            saved.getId(), saved.getName(), saved.getStatus());

        // Send-now is intentionally a separate call from the FE (POST
        // /campaigns/{id}/send). Keeping the responsibilities split
        // means the admin form can render the optimistic SENDING state
        // before the broadcast actually starts.
        return toDto(saved);
    }

    @Transactional
    public NewsletterCampaignResponse update(UUID id, NewsletterCampaignRequest request, UUID actorId) {
        NewsletterCampaign entity = getEntity(id);
        CampaignStatus before = entity.getStatus();
        applyRequest(entity, request, actorId);
        entity.setUpdatedBy(actorId);

        // Lifecycle rules: only DRAFT/SCHEDULED may be edited freely; SENT is immutable.
        if (before == CampaignStatus.SENT) {
            throw new BusinessException("NEWSLETTER_CAMPAIGN_IMMUTABLE",
                "Campaign đã gửi, không thể chỉnh sửa");
        }
        if (request.shouldSendNow()) {
            entity.setStatus(CampaignStatus.DRAFT);
        } else if (request.shouldSchedule()) {
            entity.setStatus(CampaignStatus.SCHEDULED);
        }
        NewsletterCampaign saved = campaignRepository.save(entity);
        log.info("Newsletter campaign updated id={} status={}", saved.getId(), saved.getStatus());
        return toDto(saved);
    }

    @Transactional
    public NewsletterCampaignResponse send(UUID id) {
        NewsletterCampaign entity = getEntity(id);
        // Idempotent: a previous send may have already flipped the row to
        // SENT before this call arrived (the FE double-fires on slow
        // networks). Return the current state instead of throwing so the
        // UI doesn't surface a misleading 4xx.
        if (entity.getStatus() == CampaignStatus.SENT) {
            return toDto(entity);
        }
        if (entity.getStatus() == CampaignStatus.SENDING) {
            return toDto(entity);
        }
        entity.setStatus(CampaignStatus.SENDING);
        entity.setUpdatedAt(Instant.now());
        NewsletterCampaign saved = campaignRepository.save(entity);

        sender.sendAsync(saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        NewsletterCampaign entity = getEntity(id);
        entity.setDeletedAt(Instant.now());
        campaignRepository.save(entity);
        log.info("Newsletter campaign soft-deleted id={}", id);
    }

    static List<String> parseCustomEmails(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    static String serialiseCustomEmails(List<String> emails) {
        if (emails == null || emails.isEmpty()) return null;
        return emails.stream()
            .filter(e -> e != null && !e.isBlank())
            .map(String::trim)
            .distinct()
            .collect(Collectors.joining(","));
    }

    private NewsletterCampaign applyRequest(NewsletterCampaign entity, NewsletterCampaignRequest req, UUID actorId) {
        if (req.name() != null && !req.name().isBlank()) entity.setName(req.name().trim());
        if (req.subject() != null && !req.subject().isBlank()) entity.setSubject(req.subject().trim());
        if (req.body() != null && !req.body().isBlank()) entity.setBody(req.body());

        if (req.templateId() != null && !req.templateId().isBlank()) {
            try {
                entity.setTemplateId(UUID.fromString(req.templateId()));
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("NEWSLETTER_TEMPLATE_ID_INVALID",
                    "Template id không hợp lệ: " + req.templateId());
            }
        }

        if (req.segment() != null && !req.segment().isBlank()) {
            try {
                entity.setSegment(CampaignSegment.valueOf(req.segment().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("NEWSLETTER_SEGMENT_INVALID",
                    "Segment không hợp lệ: " + req.segment());
            }
        }
        entity.setCustomEmails(serialiseCustomEmails(req.customEmails()));
        entity.setScheduledAt(req.scheduledAtAsInstant());
        // actorId is intentionally unused here; carried in callers when needed.
        if (actorId != null) {
            // future-proof placeholder for row-level ownership checks.
        }
        return entity;
    }

    private NewsletterCampaign getEntity(UUID id) {
        return campaignRepository.findById(id)
            .filter(e -> e.getDeletedAt() == null)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Newsletter campaign not found: " + id));
    }

    static NewsletterCampaignResponse toDto(NewsletterCampaign entity) {
        return NewsletterCampaignResponse.builder()
            .id(entity.getId())
            .name(entity.getName())
            .subject(entity.getSubject())
            .body(entity.getBody())
            .templateId(entity.getTemplateId())
            .segment(entity.getSegment() == null ? null : entity.getSegment().name())
            .customEmails(parseCustomEmails(entity.getCustomEmails()))
            .status(entity.getStatus() == null ? null : entity.getStatus().name())
            .scheduledAt(entity.getScheduledAt())
            .sentAt(entity.getSentAt())
            .recipientCount(entity.getRecipientCount() == null ? 0 : entity.getRecipientCount())
            .openRate(nullSafeRate(entity.getOpenRate()))
            .clickRate(nullSafeRate(entity.getClickRate()))
            .bounceRate(nullSafeRate(entity.getBounceRate()))
            .unsubRate(nullSafeRate(entity.getUnsubRate()))
            .failureReason(entity.getFailureReason())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    private static BigDecimal nullSafeRate(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
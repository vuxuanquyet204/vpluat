package com.lawfirm.brs.service.content;

import com.lawfirm.brs.entity.NewsletterCampaign;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignSegment;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignStatus;
import com.lawfirm.brs.entity.NewsletterSubscriber;
import com.lawfirm.brs.repository.NewsletterCampaignRepository;
import com.lawfirm.brs.repository.NewsletterSubscriberRepository;
import com.lawfirm.brs.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Async sender bean for newsletter campaigns.
 *
 * <p>Lives in a separate class so Spring can proxy the {@code @Async}
 * boundary; a self-invocation inside {@link NewsletterCampaignService}
 * would skip the executor and block the HTTP request until the entire
 * broadcast finishes.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NewsletterCampaignSender {

    private final NewsletterCampaignRepository campaignRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final EmailService emailService;

    @Async
    public void sendAsync(UUID id) {
        try {
            doSend(id);
        } catch (Exception ex) {
            log.error("Newsletter campaign send failed id={}", id, ex);
            markFailed(id, ex.getMessage());
        }
    }

    @Transactional
    protected void doSend(UUID id) {
        NewsletterCampaign entity = campaignRepository.findById(id)
            .orElseThrow(() -> new IllegalStateException("Newsletter campaign not found: " + id));

        List<String> recipients = resolveRecipients(entity);
        entity.setRecipientCount(recipients.size());

        int sent = 0;
        for (String email : recipients) {
            try {
                emailService.sendEmail(email, entity.getSubject(), entity.getBody(), true);
                sent += 1;
            } catch (Exception ex) {
                log.warn("Failed to deliver newsletter email campaign={} to={}", id, email, ex);
            }
        }

        entity.setStatus(CampaignStatus.SENT);
        entity.setSentAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        if (sent == 0 && recipients.isEmpty()) {
            log.info("Newsletter campaign id={} had 0 recipients; marked SENT", id);
        }
        campaignRepository.save(entity);
        log.info("Newsletter campaign id={} sent to {} recipients", id, sent);
    }

    @Transactional
    protected void markFailed(UUID id, String reason) {
        campaignRepository.findById(id).ifPresent(entity -> {
            entity.setStatus(CampaignStatus.FAILED);
            entity.setFailureReason(reason != null && reason.length() > 1000
                ? reason.substring(0, 1000) : reason);
            entity.setUpdatedAt(Instant.now());
            campaignRepository.save(entity);
        });
    }

    private List<String> resolveRecipients(NewsletterCampaign entity) {
        CampaignSegment seg = entity.getSegment() == null ? CampaignSegment.ALL : entity.getSegment();
        return switch (seg) {
            case CUSTOM -> parseCustomEmails(entity.getCustomEmails());
            case ALL, FDI, REALESTATE -> {
                // Without a tag column on subscribers we treat all three
                // segments as the full active list. Phase 4 can refine
                // by enriching NewsletterSubscriber with a tags[] column.
                yield subscriberRepository.findByStatus("ACTIVE", PageRequest.of(0, 1000))
                    .stream()
                    .map(NewsletterSubscriber::getEmail)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
            }
        };
    }

    static List<String> parseCustomEmails(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }
}
package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.FaqRequest;
import com.lawfirm.brs.dto.response.AdminFaqDTO;
import com.lawfirm.brs.dto.response.AdminFaqDTO.FaqTranslationDTO;
import com.lawfirm.brs.entity.Faq;
import com.lawfirm.brs.entity.LocaleKey;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.FaqRepository;
import com.lawfirm.brs.repository.LocaleKeyRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Admin service for FAQ CRUD + chatbot suggestion configuration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminFaqService {

    private static final String ENTITY_TYPE_FAQ = "faq";

    private final FaqRepository faqRepository;
    private final LocaleKeyRepository localeKeyRepository;
    private final ServiceEntityRepository serviceRepository;

    @Transactional(readOnly = true)
    public Page<AdminFaqDTO> list(int page, int size, Boolean isPublished, String search) {
        log.debug("Admin list FAQs page={} size={} isPublished={} search={}", page, size, isPublished, search);
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)),
            Sort.by(Sort.Direction.ASC, "displayOrder").and(Sort.by(Sort.Direction.DESC, "createdAt")));

        Page<Faq> result = isPublished == null
            ? faqRepository.findAll(pageable)
            : faqRepository.findByIsPublishedOrderByDisplayOrderAsc(isPublished, pageable);

        // Build DTO list once; client-side search filter applied post-mapping.
        List<AdminFaqDTO> dtos = result.getContent().stream().map(f -> toDto(f, null)).toList();

        if (search == null || search.isBlank()) {
            return new PageImpl<>(dtos, pageable, result.getTotalElements());
        }

        String needle = search.toLowerCase().trim();
        List<AdminFaqDTO> filtered = dtos.stream()
            .filter(d -> matchesSearch(d, needle))
            .toList();
        log.debug("Admin FAQ search '{}' kept {}/{} rows", needle, filtered.size(), dtos.size());
        return new PageImpl<>(filtered, pageable, filtered.size());
    }

    private boolean matchesSearch(AdminFaqDTO dto, String needle) {
        if ((dto.getSuggestedFor() != null && dto.getSuggestedFor().toLowerCase().contains(needle))) {
            return true;
        }
        if (dto.getTranslations() != null) {
            for (AdminFaqDTO.FaqTranslationDTO t : dto.getTranslations()) {
                if (t.getQuestion() != null && t.getQuestion().toLowerCase().contains(needle)) {
                    return true;
                }
                if (t.getAnswer() != null && t.getAnswer().toLowerCase().contains(needle)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public AdminFaqDTO get(UUID id) {
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
        return toDto(faq, null);
    }

    public AdminFaqDTO create(FaqRequest req, UUID actorId) {
        Faq faq = Faq.builder()
            .displayOrder(req.displayOrder() == null ? 0 : req.displayOrder())
            .isPublished(req.isPublished() == null ? Boolean.TRUE : req.isPublished())
            .suggestedFor(normalizeSuggestedFor(req.suggestedFor()))
            .suggestionEnabled(req.suggestionEnabled() == null ? Boolean.TRUE : req.suggestionEnabled())
            .createdBy(actorId)
            .updatedBy(actorId)
            .build();
        if (req.serviceId() != null && !req.serviceId().isBlank()) {
            faq.setService(loadService(req.serviceId()));
        }
        faq = faqRepository.save(faq);
        upsertTranslations(faq.getId(), req);
        log.info("Admin created FAQ id={} by={}", faq.getId(), actorId);
        return toDto(faq, null);
    }

    public AdminFaqDTO update(UUID id, FaqRequest req, UUID actorId) {
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));

        if (req.displayOrder() != null) faq.setDisplayOrder(req.displayOrder());
        if (req.isPublished() != null) faq.setIsPublished(req.isPublished());
        if (req.suggestedFor() != null) faq.setSuggestedFor(normalizeSuggestedFor(req.suggestedFor()));
        if (req.suggestionEnabled() != null) faq.setSuggestionEnabled(req.suggestionEnabled());
        if (req.serviceId() != null) {
            if (req.serviceId().isBlank()) {
                faq.setService(null);
            } else {
                faq.setService(loadService(req.serviceId()));
            }
        }
        faq.setUpdatedBy(actorId);
        faq = faqRepository.save(faq);
        if (req.translations() != null) {
            upsertTranslations(faq.getId(), req);
        } else if (req.question() != null || req.answer() != null) {
            // Legacy single-locale caller — write to vi
            upsertLegacyViTranslation(faq.getId(), req);
        }
        log.info("Admin updated FAQ id={} by={}", faq.getId(), actorId);
        return toDto(faq, null);
    }

    public void delete(UUID id, UUID actorId) {
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
        faq.setDeletedAt(Instant.now());
        faq.setUpdatedBy(actorId);
        faqRepository.save(faq);
        log.info("Admin soft-deleted FAQ id={} by={}", id, actorId);
    }

    public AdminFaqDTO toggleSuggestion(UUID id, UUID actorId) {
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
        faq.setSuggestionEnabled(!Boolean.TRUE.equals(faq.getSuggestionEnabled()));
        faq.setUpdatedBy(actorId);
        return toDto(faqRepository.save(faq), null);
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    private ServiceEntity loadService(String rawId) {
        try {
            UUID id = UUID.fromString(rawId);
            return serviceRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid serviceId: " + rawId, ex);
        }
    }

    private void upsertTranslations(UUID faqId, FaqRequest req) {
        if (req.translations() == null || req.translations().isEmpty()) return;
        for (FaqRequest.TranslationInput t : req.translations()) {
            if (t.locale() == null || t.locale().isBlank()) continue;
            LocaleKey key = localeKeyRepository
                .findByEntityTypeAndEntityIdAndLocale(ENTITY_TYPE_FAQ, faqId, t.locale())
                .orElseGet(() -> LocaleKey.builder()
                    .entityType(ENTITY_TYPE_FAQ)
                    .entityId(faqId)
                    .locale(t.locale())
                    .build());
            key.setTitle(t.question());
            key.setContent(t.answer());
            localeKeyRepository.save(key);
        }
    }

    private void upsertLegacyViTranslation(UUID faqId, FaqRequest req) {
        LocaleKey key = localeKeyRepository
            .findByEntityTypeAndEntityIdAndLocale(ENTITY_TYPE_FAQ, faqId, "vi")
            .orElseGet(() -> LocaleKey.builder()
                .entityType(ENTITY_TYPE_FAQ)
                .entityId(faqId)
                .locale("vi")
                .build());
        if (req.question() != null) key.setTitle(req.question());
        if (req.answer() != null) key.setContent(req.answer());
        localeKeyRepository.save(key);
    }

    private static String normalizeSuggestedFor(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return raw.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private AdminFaqDTO toDto(Faq faq, String titleNeedle) {
        AdminFaqDTO dto = AdminFaqDTO.builder()
            .id(faq.getId())
            .serviceId(faq.getService() != null ? faq.getService().getId() : null)
            .serviceName(faq.getService() != null ? faq.getService().getName() : null)
            .suggestedFor(faq.getSuggestedFor())
            .suggestionEnabled(faq.getSuggestionEnabled())
            .displayOrder(faq.getDisplayOrder())
            .isPublished(faq.getIsPublished())
            .createdAt(faq.getCreatedAt())
            .updatedAt(faq.getUpdatedAt())
            .createdBy(faq.getCreatedBy())
            .updatedBy(faq.getUpdatedBy())
            .translations(loadTranslations(faq.getId()))
            .build();
        return dto;
    }

    private List<FaqTranslationDTO> loadTranslations(UUID faqId) {
        List<LocaleKey> rows = localeKeyRepository.findAllByEntityTypeAndEntityId(ENTITY_TYPE_FAQ, faqId);
        List<FaqTranslationDTO> result = new ArrayList<>(rows.size());
        for (LocaleKey k : rows) {
            result.add(FaqTranslationDTO.builder()
                .locale(k.getLocale())
                .question(k.getTitle())
                .answer(k.getContent())
                .build());
        }
        return result;
    }
}
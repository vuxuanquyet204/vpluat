package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.FaqDTO;
import com.lawfirm.brs.entity.Faq;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.FaqMapper;
import com.lawfirm.brs.repository.FaqRepository;
import com.lawfirm.brs.service.i18n.LocaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing FAQs (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqMapper faqMapper;
    private final LocaleService localeService;

    @Cacheable(value = "faqs", key = "'all-published-' + #locale")
    public List<FaqDTO> getPublishedFaqs(String locale) {
        log.debug("Fetching all published FAQs for locale: {}", locale);
        List<Faq> faqs = faqRepository.findByIsPublishedTrueOrderByDisplayOrder();
        return mapFaqsWithTranslations(faqs, locale);
    }

    /**
     * Get published FAQs with default locale (Vietnamese).
     */
    public List<FaqDTO> getPublishedFaqs() {
        return getPublishedFaqs("vi");
    }

    @Cacheable(value = "faqs", key = "'service-' + #serviceId + '-' + #locale")
    public List<FaqDTO> getFaqsByService(UUID serviceId, String locale) {
        log.debug("Fetching FAQs by service: {}, locale: {}", serviceId, locale);
        List<Faq> faqs = faqRepository.findByServiceIdAndIsPublishedTrueOrderByDisplayOrder(serviceId);
        return mapFaqsWithTranslations(faqs, locale);
    }

    /**
     * Get FAQs by service with default locale (Vietnamese).
     */
    public List<FaqDTO> getFaqsByService(UUID serviceId) {
        return getFaqsByService(serviceId, "vi");
    }

    public FaqDTO getFaqById(UUID id, String locale) {
        log.debug("Fetching FAQ by id: {}, locale: {}", id, locale);
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
        Map<String, String> translations = localeService.getFaqTranslations(id, locale);
        return mapFaqWithTranslations(faq, translations);
    }

    /**
     * Get FAQ by ID with default locale (Vietnamese).
     */
    public FaqDTO getFaqById(UUID id) {
        return getFaqById(id, "vi");
    }

    public List<FaqDTO> getFeaturedFaqs(String locale) {
        log.debug("Fetching featured FAQs for locale: {}", locale);
        List<Faq> faqs = faqRepository.findByIsPublishedTrueOrderByDisplayOrder();
        return mapFaqsWithTranslations(faqs, locale);
    }

    /**
     * Get featured FAQs with default locale (Vietnamese).
     */
    public List<FaqDTO> getFeaturedFaqs() {
        return getFeaturedFaqs("vi");
    }

    /**
     * Map a list of FAQ entities to DTOs with translations.
     */
    private List<FaqDTO> mapFaqsWithTranslations(List<Faq> faqs, String locale) {
        if (faqs.isEmpty()) {
            return List.of();
        }

        List<UUID> faqIds = faqs.stream().map(Faq::getId).collect(Collectors.toList());
        Map<UUID, Map<String, String>> bulkTranslations = localeService.getBulkFaqTranslations(faqIds, locale);

        return faqs.stream()
                .map(faq -> mapFaqWithTranslations(faq, bulkTranslations.get(faq.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Map a single FAQ entity to DTO with translations.
     */
    private FaqDTO mapFaqWithTranslations(Faq faq, Map<String, String> translations) {
        FaqDTO dto = faqMapper.toDTO(faq);

        if (translations != null) {
            dto.setQuestion(translations.getOrDefault("question", ""));
            dto.setAnswer(translations.getOrDefault("answer", ""));
        } else {
            // Fallback: try to get translations directly
            Map<String, String> directTranslations = localeService.getFaqTranslations(faq.getId(), "vi");
            dto.setQuestion(directTranslations.getOrDefault("question", ""));
            dto.setAnswer(directTranslations.getOrDefault("answer", ""));
        }

        return dto;
    }
}

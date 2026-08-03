package com.lawfirm.brs.service.i18n;

import com.lawfirm.brs.entity.LocaleKey;
import com.lawfirm.brs.repository.LocaleKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for managing internationalization (i18n) content from locale_keys table.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LocaleService {

    private final LocaleKeyRepository localeKeyRepository;

    private static final String ENTITY_TYPE_FAQ = "faq";

    /**
     * Get translated FAQ content (question and answer) for a specific locale.
     *
     * @param faqId    the FAQ entity ID
     * @param locale   the requested locale (e.g., "vi", "en")
     * @return map containing "question" and "answer" keys, or empty map if not found
     */
    public Map<String, String> getFaqTranslations(UUID faqId, String locale) {
        log.debug("Fetching FAQ translations for id: {}, locale: {}", faqId, locale);

        Optional<LocaleKey> localeKey = localeKeyRepository
                .findByEntityTypeAndEntityIdAndLocale(ENTITY_TYPE_FAQ, faqId, locale);

        if (localeKey.isPresent()) {
            LocaleKey key = localeKey.get();
            Map<String, String> translations = new HashMap<>();
            translations.put("question", key.getTitle() != null ? key.getTitle() : "");
            translations.put("answer", key.getContent() != null ? key.getContent() : "");
            log.debug("Found FAQ translations - question: {}, answer length: {}",
                    translations.get("question"),
                    translations.get("answer") != null ? translations.get("answer").length() : 0);
            return translations;
        }

        // Fallback to Vietnamese if requested locale not found
        if (!"vi".equals(locale)) {
            log.debug("Locale {} not found, falling back to Vietnamese", locale);
            return getFaqTranslations(faqId, "vi");
        }

        log.warn("No FAQ translations found for id: {}", faqId);
        return Collections.emptyMap();
    }

    /**
     * Get translated content for multiple FAQs in bulk for better performance.
     *
     * @param faqIds the list of FAQ entity IDs
     * @param locale the requested locale
     * @return map of faqId -> (question, answer) translations
     */
    public Map<UUID, Map<String, String>> getBulkFaqTranslations(List<UUID> faqIds, String locale) {
        log.debug("Fetching bulk FAQ translations for {} FAQs, locale: {}", faqIds.size(), locale);

        Map<UUID, Map<String, String>> result = new HashMap<>();

        for (UUID faqId : faqIds) {
            Map<String, String> translations = getFaqTranslations(faqId, locale);
            if (!translations.isEmpty()) {
                result.put(faqId, translations);
            }
        }

        return result;
    }

    /**
     * Get service name translation.
     *
     * @param serviceId the service entity ID
     * @param locale    the requested locale
     * @return the translated service name, or null if not found
     */
    public String getServiceName(UUID serviceId, String locale) {
        log.debug("Fetching service name for id: {}, locale: {}", serviceId, locale);

        Optional<LocaleKey> localeKey = localeKeyRepository
                .findByEntityTypeAndEntityIdAndLocale("services", serviceId, locale);

        if (localeKey.isPresent()) {
            return localeKey.get().getTitle();
        }

        // Fallback to Vietnamese
        if (!"vi".equals(locale)) {
            return getServiceName(serviceId, "vi");
        }

        return null;
    }
}

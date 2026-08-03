package com.lawfirm.brs.service.chatbot;

import com.lawfirm.brs.dto.response.FaqSuggestionDTO;
import com.lawfirm.brs.repository.FaqRepository;
import com.lawfirm.brs.service.i18n.LocaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Ranks FAQs for a chatbot turn. Two-layer strategy:
 *
 * <ol>
 *   <li><b>Semantic</b>: pg_trgm similarity between user message and FAQ question.</li>
 *   <li><b>Intent fallback</b>: admin-tagged {@code suggested_for} CSV contains the
 *       classified intent — guarantees at least one suggestion for popular intents.</li>
 *   <li><b>Top published</b>: last-resort fill so the widget always has content when
 *       the database has any published FAQs.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FaqSuggestionService {

    private final FaqRepository faqRepository;
    private final LocaleService localeService;

    @Value("${app.chatbot.faq.suggestion-limit:3}")
    private int defaultLimit;

    @Value("${app.chatbot.faq.similarity-threshold:0.15}")
    private double similarityThreshold;

    public List<FaqSuggestionDTO> suggest(String userMessage, String intent, String locale, int limit) {
        int cap = limit > 0 ? Math.min(limit, 10) : Math.min(defaultLimit, 10);
        String safeLocale = (locale == null || locale.isBlank()) ? "vi" : locale;

        Set<UUID> picked = new LinkedHashSet();
        List<Double> scores = new ArrayList<>();

        // Layer 1 — semantic search (skip when query is empty / too short)
        if (userMessage != null && userMessage.trim().length() >= 3) {
            List<UUID> semantic = faqRepository.findSuggestedFaqIds(userMessage.trim(), safeLocale, cap);
            for (UUID id : semantic) {
                if (picked.add(id)) scores.add(0.0); // similarity is computed in SQL; we just mark presence
            }
        }

        // Layer 2 — intent fallback when semantic came up short
        if (picked.size() < cap && intent != null && !intent.isBlank() && !"UNKNOWN".equalsIgnoreCase(intent)) {
            int remaining = cap - picked.size();
            List<UUID> byIntent = faqRepository.findFallbackFaqIdsForIntent(intent, remaining);
            for (UUID id : byIntent) {
                if (picked.add(id)) scores.add(null);
            }
        }

        // Layer 3 — top published FAQs as last resort
        if (picked.size() < cap) {
            int remaining = cap - picked.size();
            List<UUID> top = faqRepository.findTopPublishedFaqIds(remaining * 2);
            for (UUID id : top) {
                if (picked.add(id)) scores.add(null);
                if (picked.size() >= cap) break;
            }
        }

        if (picked.isEmpty()) {
            return List.of();
        }

        List<UUID> ids = new ArrayList<>(picked);
        Map<UUID, Map<String, String>> translations = localeService.getBulkFaqTranslations(ids, safeLocale);

        List<FaqSuggestionDTO> result = new ArrayList<>(ids.size());
        for (int i = 0; i < ids.size(); i++) {
            UUID id = ids.get(i);
            Map<String, String> tr = translations.get(id);
            if (tr == null) continue;
            String question = tr.get("question");
            String answer = tr.get("answer");
            if (question == null || question.isBlank()) continue;
            result.add(FaqSuggestionDTO.builder()
                .id(id)
                .question(question)
                .answer(answer)
                .relevance(scores.size() > i ? scores.get(i) : null)
                .build());
        }
        log.debug("Suggested {} FAQs for intent={} locale={}", result.size(), intent, safeLocale);
        return result;
    }
}
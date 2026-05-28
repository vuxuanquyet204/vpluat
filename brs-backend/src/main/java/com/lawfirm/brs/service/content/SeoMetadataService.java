package com.lawfirm.brs.service.content;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for generating SEO metadata.
 * Provides methods for auto-generating meta titles, descriptions, and keywords.
 */
@Service
@Slf4j
public class SeoMetadataService {

    private static final int DEFAULT_TITLE_MAX_LENGTH = 60;
    private static final int DEFAULT_DESCRIPTION_MAX_LENGTH = 160;
    private static final int KEYWORD_MIN_LENGTH = 3;

    private static final Set<String> STOP_WORDS = Set.of(
        "và", "của", "là", "có", "được", "trong", "với", "cho", "để", "không",
        "the", "and", "or", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
        "a", "an", "the", "this", "that", "these", "those", "in", "on", "at", "by",
        "for", "with", "about", "into", "through", "during", "before", "after"
    );

    private static final Pattern WORD_PATTERN = Pattern.compile("\\p{L}+");
    private static final Pattern VIETNAMESE_PATTERN = Pattern.compile("[a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]+");

    /**
     * Generate meta title with suffix
     * Format: "Page Title | Site Name" or custom suffix
     */
    public String generateMetaTitle(String title, String suffix) {
        return generateMetaTitle(title, suffix, DEFAULT_TITLE_MAX_LENGTH);
    }

    /**
     * Generate meta title with custom max length
     */
    public String generateMetaTitle(String title, String suffix, int maxLength) {
        if (title == null || title.isBlank()) {
            return "";
        }

        String result = title.trim();

        // Add suffix if provided
        if (suffix != null && !suffix.isBlank()) {
            result = result + " | " + suffix;
        }

        // Truncate if necessary
        if (result.length() > maxLength) {
            result = result.substring(0, maxLength - 3) + "...";
        }

        return result;
    }

    /**
     * Generate meta description from content
     */
    public String generateMetaDescription(String content, int maxLength) {
        if (content == null || content.isBlank()) {
            return "";
        }

        // Strip HTML tags
        String text = content.replaceAll("<[^>]+>", " ")
                              .replaceAll("\\s+", " ")
                              .trim();

        if (text.length() <= maxLength) {
            return text;
        }

        // Try to cut at sentence boundary
        int cutoff = findSentenceBoundary(text, maxLength);
        if (cutoff > maxLength * 0.5) {
            return text.substring(0, cutoff).trim();
        }

        // Cut at word boundary
        int lastSpace = text.lastIndexOf(' ', maxLength);
        if (lastSpace > maxLength * 0.6) {
            return text.substring(0, lastSpace).trim() + "...";
        }

        return text.substring(0, maxLength).trim() + "...";
    }

    /**
     * Generate meta description with default max length (160 chars)
     */
    public String generateMetaDescription(String content) {
        return generateMetaDescription(content, DEFAULT_DESCRIPTION_MAX_LENGTH);
    }

    /**
     * Extract keywords from content
     */
    public List<String> extractKeywords(String content, int maxKeywords) {
        if (content == null || content.isBlank()) {
            return Collections.emptyList();
        }

        // Strip HTML and normalize
        String text = content.replaceAll("<[^>]+>", " ")
                            .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                            .toLowerCase()
                            .trim();

        // Count word frequency
        Map<String, Integer> wordCount = new HashMap<>();
        Matcher matcher = VIETNAMESE_PATTERN.matcher(text);

        while (matcher.find()) {
            String word = matcher.group();
            if (word.length() >= KEYWORD_MIN_LENGTH && !STOP_WORDS.contains(word)) {
                wordCount.merge(word, 1, Integer::sum);
            }
        }

        // Sort by frequency and take top keywords
        return wordCount.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(maxKeywords)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    /**
     * Extract keywords with default limit (10 keywords)
     */
    public List<String> extractKeywords(String content) {
        return extractKeywords(content, 10);
    }

    /**
     * Generate Open Graph title
     */
    public String generateOgTitle(String title, String siteName) {
        if (title == null || title.isBlank()) {
            return siteName != null ? siteName : "";
        }
        // Remove site name suffix if present to avoid duplication
        String cleanTitle = title.replaceAll("\\s*\\|\\s*" + (siteName != null ? Pattern.quote(siteName) : "[^|]+") + "\\s*$", "");
        return cleanTitle.trim();
    }

    /**
     * Generate URL slug from title
     */
    public String generateSlug(String title) {
        if (title == null || title.isBlank()) {
            return "";
        }

        String result = title.toLowerCase()
            // Vietnamese diacritics
            .replaceAll("[àáảãạăằắẳẵặâầấẩẫậ]", "a")
            .replaceAll("[èéẻẽẹêềếểễệ]", "e")
            .replaceAll("[ìíỉĩị]", "i")
            .replaceAll("[òóỏõọôồốổỗộơờớởỡợ]", "o")
            .replaceAll("[ùúủũụưừứửữự]", "u")
            .replaceAll("[ỳýỷỹỵ]", "y")
            .replace("đ", "d")
            // Remove special characters
            .replaceAll("[^a-z0-9\\s-]", "")
            // Normalize whitespace and dashes
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        return result;
    }

    /**
     * Generate canonical URL
     */
    public String generateCanonicalUrl(String baseUrl, String slug) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return slug;
        }
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String cleanSlug = slug.startsWith("/") ? slug : "/" + slug;
        return base + cleanSlug;
    }

    /**
     * Calculate reading time in minutes
     */
    public int calculateReadingTime(String content) {
        if (content == null || content.isBlank()) {
            return 0;
        }

        // Strip HTML
        String text = content.replaceAll("<[^>]+>", " ");

        // Count words (Vietnamese text typically has shorter words)
        Matcher matcher = WORD_PATTERN.matcher(text);
        int wordCount = 0;
        while (matcher.find()) {
            wordCount++;
        }

        // Average reading speed: 200 words per minute for Vietnamese
        int minutes = (int) Math.ceil(wordCount / 200.0);
        return Math.max(1, minutes);
    }

    private int findSentenceBoundary(String text, int maxLength) {
        String shortText = text.substring(0, Math.min(text.length(), maxLength + 50));
        int lastPeriod = shortText.lastIndexOf('.');
        int lastQuestion = shortText.lastIndexOf('?');
        int lastExclamation = shortText.lastIndexOf('!');

        int boundary = Math.max(lastPeriod, Math.max(lastQuestion, lastExclamation));

        if (boundary > maxLength * 0.5) {
            return boundary + 1;
        }

        return maxLength;
    }
}

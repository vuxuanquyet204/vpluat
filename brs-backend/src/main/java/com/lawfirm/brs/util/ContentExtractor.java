package com.lawfirm.brs.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utility for extracting plain text content from HTML for SEO purposes.
 * Used for generating meta descriptions and search snippets.
 */
@Component
public class ContentExtractor {

    private static final int DEFAULT_DESCRIPTION_LENGTH = 160;
    private static final int MIN_DESCRIPTION_LENGTH = 50;

    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s+");
    private static final Pattern PUNCTUATION_PATTERN = Pattern.compile("[.!?]+$");

    /**
     * Extract plain text content from HTML, stripping all tags.
     *
     * @param html the HTML content
     * @return plain text without HTML tags
     */
    public String extractText(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        
        String cleaned = Jsoup.clean(html, Safelist.none());
        String text = Jsoup.parse(cleaned).text();
        
        return normalizeWhitespace(text);
    }

    /**
     * Generate an SEO-friendly description from HTML content.
     * Strips HTML, truncates to optimal length, and ends at word boundary.
     *
     * @param html the HTML content
     * @return a description suitable for SEO meta tags
     */
    public String generateDescription(String html) {
        return generateDescription(html, DEFAULT_DESCRIPTION_LENGTH);
    }

    /**
     * Generate an SEO-friendly description with custom length.
     *
     * @param html   the HTML content
     * @param maxLength the maximum length of the description
     * @return a description suitable for SEO meta tags
     */
    public String generateDescription(String html, int maxLength) {
        String text = extractText(html);
        
        if (text.length() <= maxLength) {
            return text;
        }
        
        String truncated = text.substring(0, maxLength);
        
        int lastSpace = truncated.lastIndexOf(' ');
        int lastNewline = truncated.lastIndexOf('\n');
        int lastPunctuation = Math.max(lastSpace, lastNewline);
        
        if (lastPunctuation > maxLength - MIN_DESCRIPTION_LENGTH) {
            truncated = truncated.substring(0, lastPunctuation).trim();
        }
        
        truncated = PUNCTUATION_PATTERN.matcher(truncated).replaceAll("");
        
        return truncated + "...";
    }

    /**
     * Extract the first paragraph from HTML content.
     *
     * @param html the HTML content
     * @return the first paragraph, or empty string if none found
     */
    public String extractFirstParagraph(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        
        var doc = Jsoup.parse(html);
        var paragraphs = doc.select("p");
        
        if (paragraphs.isEmpty()) {
            return extractText(html);
        }
        
        return normalizeWhitespace(paragraphs.first().text());
    }

    /**
     * Count approximate reading time in minutes.
     *
     * @param html the HTML content
     * @return estimated reading time in minutes
     */
    public int estimateReadingTime(String html) {
        String text = extractText(html);
        
        int wordCount = text.split("\\s+").length;
        
        int wordsPerMinute = 200;
        
        return Math.max(1, (int) Math.ceil((double) wordCount / wordsPerMinute));
    }

    /**
     * Extract keywords from HTML content.
     * Returns the most common words, excluding common stop words.
     *
     * @param html the HTML content
     * @param maxKeywords maximum number of keywords to return
     * @return array of keywords
     */
    public String[] extractKeywords(String html, int maxKeywords) {
        String text = extractText(html).toLowerCase();
        
        var stopWords = java.util.Set.of(
            "và", "của", "là", "có", "được", "trong", "cho", "với",
            "the", "and", "is", "in", "to", "of", "a", "an", "for",
            "đã", "để", "từ", "này", "không", "các", "những", "một",
            "that", "this", "with", "are", "was", "were", "be", "been"
        );
        
        var words = text.split("\\s+");
        var frequency = new java.util.HashMap<String, Integer>();
        
        for (String word : words) {
            if (word.length() < 3 || stopWords.contains(word)) {
                continue;
            }
            word = word.replaceAll("[^a-zA-ZÀ-ỹ]", "");
            if (!word.isEmpty()) {
                frequency.merge(word, 1, Integer::sum);
            }
        }
        
        return frequency.entrySet().stream()
            .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
            .limit(maxKeywords)
            .map(java.util.Map.Entry::getKey)
            .toArray(String[]::new);
    }

    private String normalizeWhitespace(String text) {
        return WHITESPACE_PATTERN.matcher(text.trim()).replaceAll(" ");
    }
}

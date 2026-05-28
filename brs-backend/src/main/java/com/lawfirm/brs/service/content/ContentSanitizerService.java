package com.lawfirm.brs.service.content;

import lombok.extern.slf4j.Slf4j;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ContentSanitizerService {

    private static final PolicyFactory STRICT_POLICY = new HtmlPolicyBuilder()
        .allowElements("p", "br", "strong", "em", "u", "ol", "ul", "li", "a", "h1", "h2", "h3", "h4", "h5", "h6")
        .allowAttributes("href").onElements("a")
        .allowAttributes("class").onElements("*")
        .toFactory();

    private static final PolicyFactory RELAXED_POLICY = new HtmlPolicyBuilder()
        .allowElements("p", "br", "div", "span", "strong", "em", "u", "s", "ol", "ul", "li", "a", "img", "h1", "h2", "h3", "h4", "h5", "h6",
            "table", "thead", "tbody", "tr", "th", "td", "blockquote", "pre", "code", "section", "article", "header", "footer", "nav")
        .allowAttributes("href").onElements("a")
        .allowAttributes("src", "alt", "title").onElements("img")
        .allowAttributes("class").onElements("*")
        .allowAttributes("id").onElements("*")
        .allowAttributes("width", "height").onElements("img", "table", "td", "th")
        .allowAttributes("colspan", "rowspan").onElements("td", "th")
        .toFactory();

    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        try {
            return STRICT_POLICY.sanitize(html);
        } catch (Exception e) {
            log.warn("Failed to sanitize HTML content", e);
            return "";
        }
    }

    public String sanitizeRelaxed(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        try {
            return RELAXED_POLICY.sanitize(html);
        } catch (Exception e) {
            log.warn("Failed to sanitize HTML content", e);
            return "";
        }
    }

    public boolean isSafe(String html) {
        if (html == null || html.isBlank()) {
            return true;
        }
        String sanitized = sanitize(html);
        return !containsScriptTags(sanitized);
    }

    public String stripHtml(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        String text = html.replaceAll("<[^>]+>", " ");
        text = text.replaceAll("\\s+", " ");
        return text.trim();
    }

    public String extractPreview(String html, int maxLength) {
        String text = stripHtml(html);
        if (text.length() <= maxLength) {
            return text;
        }
        int lastSpace = text.lastIndexOf(' ', maxLength);
        if (lastSpace > maxLength / 2) {
            return text.substring(0, lastSpace) + "...";
        }
        return text.substring(0, maxLength) + "...";
    }

    private boolean containsScriptTags(String content) {
        String lower = content.toLowerCase();
        return lower.contains("<script") ||
               lower.contains("javascript:") ||
               lower.contains("onerror=") ||
               lower.contains("onload=") ||
               lower.contains("onclick=");
    }
}

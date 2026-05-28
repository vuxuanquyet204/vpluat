package com.lawfirm.brs.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility for slug generation from text.
 */
public final class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern DUPLICATE_DASH = Pattern.compile("-+");

    private SlugUtil() {
        // Utility class
    }

    /**
     * Generate URL-friendly slug from text
     */
    public static String generate(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }
        
        String slug = text.toLowerCase(Locale.forLanguageTag("vi"));
        
        // Normalize unicode characters
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = NONLATIN.matcher(slug).replaceAll("");
        slug = WHITESPACE.matcher(slug).replaceAll("-");
        slug = DUPLICATE_DASH.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");
        
        return slug;
    }

    /**
     * Generate unique slug with suffix
     */
    public static String generateUnique(String text, String existingSlug) {
        String baseSlug = generate(text);
        
        if (existingSlug == null || !existingSlug.startsWith(baseSlug)) {
            return baseSlug;
        }
        
        // If existing slug is same as base, append number
        if (existingSlug.equals(baseSlug)) {
            return baseSlug + "-2";
        }
        
        // Extract existing number and increment
        String[] parts = existingSlug.split("-");
        try {
            int num = Integer.parseInt(parts[parts.length - 1]);
            return baseSlug + "-" + (num + 1);
        } catch (NumberFormatException e) {
            return baseSlug + "-2";
        }
    }

    /**
     * Validate slug format
     */
    public static boolean isValid(String slug) {
        if (slug == null || slug.isBlank()) {
            return false;
        }
        return slug.matches("^[a-z0-9]+(-[a-z0-9]+)*$");
    }
}

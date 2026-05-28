package com.lawfirm.brs.util;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

/**
 * Utility for phone number validation and formatting.
 */
public final class PhoneNumberUtil {

    private static final Pattern VIETNAM_PHONE_PATTERN = Pattern.compile(
        "^(0[3|5|7|8|9])[0-9]{8}$"
    );

    private static final Pattern INTERNATIONAL_PHONE_PATTERN = Pattern.compile(
        "^\\+?[1-9]\\d{1,14}$"
    );

    private PhoneNumberUtil() {
        // Utility class
    }

    /**
     * Validate Vietnamese phone number
     */
    public static boolean isValidVietnamPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        String normalized = normalizePhone(phone);
        return VIETNAM_PHONE_PATTERN.matcher(normalized).matches();
    }

    /**
     * Validate international phone number
     */
    public static boolean isValidInternationalPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        String normalized = normalizePhone(phone);
        return INTERNATIONAL_PHONE_PATTERN.matcher(normalized).matches();
    }

    /**
     * Normalize phone number to E.164 format
     */
    public static String normalizeToE164(String phone) {
        if (phone == null) {
            return null;
        }
        String normalized = phone.trim().replaceAll("[\\s\\-\\(\\)]", "");
        
        if (normalized.startsWith("0")) {
            return "+84" + normalized.substring(1);
        }
        
        if (!normalized.startsWith("+")) {
            return "+" + normalized;
        }
        
        return normalized;
    }

    /**
     * Format phone for display
     */
    public static String formatForDisplay(String phone) {
        if (phone == null) {
            return null;
        }
        String normalized = normalizePhone(phone);
        
        if (normalized.startsWith("+84")) {
            return "0" + normalized.substring(3);
        }
        
        return normalized;
    }

    /**
     * Normalize phone by removing formatting
     */
    public static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        return phone.trim().replaceAll("[\\s\\-\\(\\)\\.]", "");
    }

    /**
     * Check if phone is mobile
     */
    public static boolean isMobile(String phone) {
        if (!isValidVietnamPhone(phone)) {
            return false;
        }
        String normalized = normalizePhone(phone);
        return normalized.startsWith("09") || 
               normalized.startsWith("08") || 
               normalized.startsWith("07") || 
               normalized.startsWith("05");
    }

    /**
     * Mask phone number for privacy (e.g., 0912345678 -> 0912***678)
     */
    public static String mask(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        String normalized = normalizePhone(phone);
        return normalized.substring(0, 4) + "***" + normalized.substring(normalized.length() - 3);
    }
}

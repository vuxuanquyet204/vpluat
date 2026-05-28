package com.lawfirm.brs.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Standard error codes for API responses.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCodes {

    // Authentication & Authorization
    UNAUTHORIZED("AUTH_001", "Authentication required"),
    TOKEN_EXPIRED("AUTH_002", "Token has expired"),
    TOKEN_INVALID("AUTH_003", "Token is invalid"),
    ACCOUNT_LOCKED("AUTH_004", "Account is temporarily locked"),
    ACCOUNT_DISABLED("AUTH_005", "Account is disabled"),
    INVALID_CREDENTIALS("AUTH_006", "Invalid email or password"),
    REFRESH_TOKEN_REUSED("AUTH_007", "Refresh token has been reused - possible security threat"),
    INSUFFICIENT_PERMISSIONS("AUTH_008", "Insufficient permissions"),

    // Validation
    VALIDATION_ERROR("VAL_001", "Request validation failed"),
    INVALID_REQUEST("VAL_002", "Invalid request format"),
    INVALID_EMAIL("VAL_003", "Invalid email address"),
    INVALID_PHONE("VAL_004", "Invalid phone number"),
    INVALID_OTP("VAL_005", "Invalid or expired OTP"),
    MISSING_REQUIRED_FIELD("VAL_006", "Required field is missing"),
    INVALID_SLUG("VAL_007", "Invalid slug format"),
    DUPLICATE_VALUE("VAL_008", "Value already exists"),

    // Resource
    NOT_FOUND("RES_001", "Resource not found"),
    USER_NOT_FOUND("RES_002", "User not found"),
    SERVICE_NOT_FOUND("RES_003", "Service not found"),
    LAWYER_NOT_FOUND("RES_004", "Lawyer not found"),
    POST_NOT_FOUND("RES_005", "Post not found"),
    APPOINTMENT_NOT_FOUND("RES_006", "Appointment not found"),
    LEAD_NOT_FOUND("RES_007", "Lead not found"),
    CATEGORY_NOT_FOUND("RES_008", "Category not found"),
    SLOT_NOT_AVAILABLE("RES_009", "Time slot is not available"),

    // Business Logic
    SLOT_ALREADY_BOOKED("BIZ_001", "This time slot is already booked"),
    APPOINTMENT_CANNOT_CANCEL("BIZ_002", "Appointment cannot be cancelled"),
    APPOINTMENT_ALREADY_CONFIRMED("BIZ_003", "Appointment is already confirmed"),
    LEAD_DUPLICATE("BIZ_004", "Duplicate lead detected"),
    NEWSLETTER_ALREADY_SUBSCRIBED("BIZ_005", "Email already subscribed"),
    NEWSLETTER_NOT_SUBSCRIBED("BIZ_006", "Email is not subscribed"),
    JOB_NOT_PUBLISHED("BIZ_007", "Job posting is not published"),
    JOB_DEADLINE_PASSED("BIZ_008", "Job application deadline has passed"),
    POST_NOT_PUBLISHED("BIZ_009", "Post is not published"),
    SELF_ASSIGN_NOT_ALLOWED("BIZ_010", "Cannot assign to yourself"),

    // Rate Limiting
    RATE_LIMIT_EXCEEDED("RATE_001", "Too many requests. Please try again later"),
    OTP_RATE_LIMIT_EXCEEDED("RATE_002", "Too many OTP requests. Please try again later"),

    // File Handling
    FILE_EMPTY("FILE_001", "File is empty"),
    FILE_TOO_LARGE("FILE_002", "File size exceeds limit"),
    FILE_TYPE_NOT_ALLOWED("FILE_003", "File type is not allowed"),
    FILE_UPLOAD_FAILED("FILE_004", "File upload failed"),
    MALWARE_DETECTED("FILE_005", "Malware detected in uploaded file"),

    // External Services
    SMS_SEND_FAILED("EXT_001", "Failed to send SMS"),
    EMAIL_SEND_FAILED("EXT_002", "Failed to send email"),
    PAYMENT_FAILED("EXT_003", "Payment processing failed"),
    EXTERNAL_SERVICE_UNAVAILABLE("EXT_004", "External service is temporarily unavailable"),

    // System
    INTERNAL_ERROR("SYS_001", "An unexpected error occurred"),
    SERVICE_UNAVAILABLE("SYS_002", "Service is temporarily unavailable"),
    DATABASE_ERROR("SYS_003", "Database operation failed"),
    CACHE_ERROR("SYS_004", "Cache operation failed"),
    CONCURRENT_MODIFICATION("SYS_005", "Data was modified by another user");

    private final String code;
    private final String defaultMessage;

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}

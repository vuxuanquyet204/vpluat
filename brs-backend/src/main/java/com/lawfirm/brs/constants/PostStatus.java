package com.lawfirm.brs.constants;

/**
 * Post status values for content management.
 */
public enum PostStatus {
    DRAFT,      // Not published
    SCHEDULED,  // Scheduled for future publication
    PUBLISHED,  // Live and visible
    ARCHIVED    // No longer visible but not deleted
}

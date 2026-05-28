package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Locale keys entity for i18n translation storage.
 */
@Entity
@Table(name = "locale_keys",
    uniqueConstraints = @UniqueConstraint(columnNames = {"entity_type", "entity_id", "locale"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocaleKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "locale", nullable = false)
    @Builder.Default
    private String locale = "vi";

    @Column(name = "title")
    private String title;

    @Column(name = "excerpt", columnDefinition = "TEXT")
    private String excerpt;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "meta_title")
    private String metaTitle;

    @Column(name = "meta_desc")
    private String metaDesc;

    /**
     * Get title for current locale, fallback to Vietnamese
     */
    public String getLocalizedTitle(String requestedLocale) {
        if (requestedLocale != null && requestedLocale.equals(this.locale)) {
            return title;
        }
        return title;
    }

    /**
     * Get content for current locale
     */
    public String getLocalizedContent(String requestedLocale) {
        if (requestedLocale != null && requestedLocale.equals(this.locale)) {
            return content;
        }
        return content;
    }
}

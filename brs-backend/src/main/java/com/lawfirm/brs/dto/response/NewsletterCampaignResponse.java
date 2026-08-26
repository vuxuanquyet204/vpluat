package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Newsletter campaign DTO returned to admin clients.
 *
 * <p>The wire-level fields mirror the existing frontend
 * {@code @/features/admin/types} {@code Campaign} interface so the
 * admin page can stay type-compatible without changing adapters.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterCampaignResponse {
    private UUID id;
    private String name;
    private String subject;
    private String body;
    private UUID templateId;
    /** ALL | FDI | REALESTATE | CUSTOM */
    private String segment;
    /** Materialised only for the {@code CUSTOM} segment. */
    private List<String> customEmails;
    /** DRAFT | SCHEDULED | SENDING | SENT | FAILED */
    private String status;
    private Instant scheduledAt;
    private Instant sentAt;
    private Integer recipientCount;
    /** Stored as 0–1 in DB; surfaced as the same range to FE. */
    private BigDecimal openRate;
    private BigDecimal clickRate;
    private BigDecimal bounceRate;
    private BigDecimal unsubRate;
    private String failureReason;
    private UUID createdBy;
    private Instant createdAt;
    private Instant updatedAt;
}

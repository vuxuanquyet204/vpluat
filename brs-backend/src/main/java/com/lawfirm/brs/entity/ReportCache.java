package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Cache for expensive report aggregations. TTL via expires_at.
 */
@Entity
@Table(name = "report_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCache {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "report_type", nullable = false)
    private String reportType;

    @Column(name = "params", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String params = "{}";

    @Column(name = "data", nullable = false, columnDefinition = "jsonb")
    private String data;

    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = Instant.now();
    }
}

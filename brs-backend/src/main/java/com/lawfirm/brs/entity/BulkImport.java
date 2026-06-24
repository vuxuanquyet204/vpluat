package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks a bulk CSV import job — successes, failures, error log.
 */
@Entity
@Table(name = "bulk_imports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkImport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "total_rows", nullable = false)
    @Builder.Default
    private Integer totalRows = 0;

    @Column(name = "imported_count", nullable = false)
    @Builder.Default
    private Integer importedCount = 0;

    @Column(name = "failed_count", nullable = false)
    @Builder.Default
    private Integer failedCount = 0;

    @Column(name = "error_log", columnDefinition = "jsonb")
    private String errorLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imported_by")
    private User importedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Activity entry on a lead (status change, note, call, email, etc.).
 * Powers the lead timeline view in the CRM admin.
 */
@Entity
@Table(name = "lead_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "action", nullable = false)
    private String action; // CREATED, STATUS_CHANGED, ASSIGNED, NOTED, EMAILED, CALLED

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // PostgreSQL requires a jsonb column. Using @JdbcTypeCode(SqlTypes.JSON)
    // lets Hibernate send a real JSON payload instead of a raw varchar that
    // the driver cannot bind directly. We store a Map<String, Object> so
    // callers can attach arbitrary context (status changes, assignee ids, ...).
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private String metadata = "{}";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

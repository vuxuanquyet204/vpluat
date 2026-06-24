package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

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

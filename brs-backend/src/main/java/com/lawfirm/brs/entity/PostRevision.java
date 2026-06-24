package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Snapshot of a post at a given revision number.
 * Enables version history and one-click revert in admin.
 */
@Entity
@Table(name = "post_revisions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "revision_number"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "revision_number", nullable = false)
    private Integer revisionNumber;

    @Column(name = "snapshot", nullable = false, columnDefinition = "jsonb")
    private String snapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edited_by")
    private User editedBy;

    @Column(name = "change_note", columnDefinition = "TEXT")
    private String changeNote;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}

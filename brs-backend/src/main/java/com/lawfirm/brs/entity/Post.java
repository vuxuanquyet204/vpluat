package com.lawfirm.brs.entity;

import com.lawfirm.brs.constants.PostStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Post entity for blog/content management.
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PostStatus status = PostStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "views")
    @Builder.Default
    private Integer views = 0;

    @Column(name = "reading_time")
    private Integer readingTime;

    @Column(name = "og_image_url")
    private String ogImageUrl;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "language")
    @Builder.Default
    private String language = "vi";

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostTag> postTags = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Publish the post
     */
    public void publish() {
        this.status = PostStatus.PUBLISHED;
        this.publishedAt = Instant.now();
    }

    /**
     * Schedule the post for future publication
     */
    public void schedule(Instant scheduledTime) {
        this.status = PostStatus.SCHEDULED;
        this.scheduledAt = scheduledTime;
    }

    /**
     * Archive the post
     */
    public void archive() {
        this.status = PostStatus.ARCHIVED;
    }

    /**
     * Soft delete the post
     */
    public void softDelete() {
        this.deletedAt = Instant.now();
        this.status = PostStatus.ARCHIVED;
    }

    /**
     * Increment view count
     */
    public void incrementViews() {
        this.views++;
    }

    /**
     * Check if post is published
     */
    public boolean isPublished() {
        return status == PostStatus.PUBLISHED && publishedAt != null && deletedAt == null;
    }
}

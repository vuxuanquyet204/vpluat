package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Post-Tag mapping entity.
 */
@Entity
@Table(name = "post_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostTag {

    @Id
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Id
    @ManyToOne
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostTag other)) return false;
        return post != null && other.post != null
            && post.getId().equals(other.post.getId())
            && tag != null && other.tag != null
            && tag.getId().equals(other.tag.getId());
    }

    @Override
    public int hashCode() {
        if (post == null || tag == null) return 0;
        return 31 * post.getId().hashCode() + tag.getId().hashCode();
    }
}

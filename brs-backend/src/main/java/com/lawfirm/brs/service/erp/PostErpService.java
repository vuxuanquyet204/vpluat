package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.PostStatus;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PostRevisionDTO;
import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.entity.PostRevision;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.PostRepository;
import com.lawfirm.brs.repository.PostRevisionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Post ERP extensions: revisions (version history) and duplicate-as-draft.
 * Sits alongside {@link com.lawfirm.brs.service.content.PostManagementService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PostErpService {

    private final PostRepository postRepository;
    private final PostRevisionRepository revisionRepository;
    private final PostMapper postMapper;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    /**
     * Return version history for a post (most recent first).
     */
    @Transactional(readOnly = true)
    public PageResponse<PostRevisionDTO> revisions(UUID postId, int page, int size) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        Page<PostRevision> result = revisionRepository
            .findByPostIdOrderByRevisionNumberDesc(postId,
                PageRequest.of(page, size));
        List<PostRevisionDTO> dtos = result.getContent().stream()
            .map(this::revisionToDto)
            .toList();
        return PageResponse.of(dtos, page, size, result.getTotalElements());
    }

    /**
     * Delete all revisions for a given post (used when cascading post deletion).
     */
    public void deleteRevisionsForPost(UUID postId) {
        revisionRepository.findByPostIdOrderByRevisionNumberDesc(postId, PageRequest.of(0, Integer.MAX_VALUE))
            .forEach(revisionRepository::delete);
    }

    /**
     * Snapshot the current post into a new revision. Typically called
     * before update / publish / unpublish so the history is preserved.
     */
    public PostRevision snapshot(UUID postId, UUID editorId, String changeNote) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        long next = revisionRepository.countByPostId(postId) + 1;
        String snapshot = toJson(post);
        PostRevision rev = PostRevision.builder()
            .post(post)
            .revisionNumber((int) next)
            .snapshot(snapshot)
            .editedBy(loadUserRef(editorId))
            .changeNote(changeNote)
            .build();
        return revisionRepository.save(rev);
    }

    /**
     * Restore a post to the state captured by the given revision.
     */
    public void restoreRevision(UUID postId, UUID revisionId) {
        PostRevision revision = revisionRepository.findById(revisionId)
            .orElseThrow(() -> new ResourceNotFoundException("Revision not found: " + revisionId));
        if (!revision.getPost().getId().equals(postId)) {
            throw new ResourceNotFoundException("Revision does not belong to post " + postId);
        }
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        applySnapshot(post, revision.getSnapshot());
        postRepository.save(post);
        // Record the restore as a new revision so the timeline stays accurate.
        snapshot(postId, null, "restore:" + revision.getRevisionNumber());
        log.info("Restored post {} from revision {}", postId, revision.getRevisionNumber());
    }

    /**
     * Clone a post as a new draft with a unique slug.
     */
    public PostDTO duplicate(UUID postId, UUID editorId) {
        Post src = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        String newSlug = generateUniqueSlug(src.getSlug() + "-copy");
        Post copy = Post.builder()
            .slug(newSlug)
            .thumbnailUrl(src.getThumbnailUrl())
            .author(src.getAuthor())
            .category(src.getCategory())
            .status(PostStatus.DRAFT)
            .views(0)
            .ogImageUrl(src.getOgImageUrl())
            .language(src.getLanguage())
            .build();
        postRepository.save(copy);
        // Also snapshot the source before duplication
        snapshot(postId, editorId, "Duplicated as " + newSlug);
        return postMapper.toDTO(copy);
    }

    private String generateUniqueSlug(String base) {
        String candidate = base;
        int suffix = 1;
        while (postRepository.existsBySlug(candidate)) {
            candidate = base + "-" + (++suffix);
        }
        return candidate;
    }

    private PostRevisionDTO revisionToDto(PostRevision rev) {
        return new PostRevisionDTO(
            rev.getId(),
            rev.getPost().getId(),
            rev.getRevisionNumber(),
            rev.getSnapshot(),
            rev.getChangeNote(),
            rev.getCreatedAt()
        );
    }

    private String toJson(Post post) {
        try {
            return objectMapper.writeValueAsString(toSnapshotMap(post));
        } catch (Exception e) {
            log.warn("Snapshot serialization failed", e);
            return "{}";
        }
    }

    /**
     * Project a Post entity into a plain Map suitable for JSON snapshotting.
     * We deliberately avoid serializing the entity directly because lazy
     * associations (author, category, postTags) would otherwise drag Hibernate
     * proxies into Jackson, which blows up with
     * "No serializer found for class ByteBuddyInterceptor".
     */
    private Map<String, Object> toSnapshotMap(Post post) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", post.getId());
        data.put("slug", post.getSlug());
        data.put("thumbnailUrl", post.getThumbnailUrl());
        data.put("ogImageUrl", post.getOgImageUrl());
        data.put("status", post.getStatus() != null ? post.getStatus().name() : null);
        data.put("views", post.getViews());
        data.put("language", post.getLanguage());
        data.put("title", post.getTitle());
        data.put("excerpt", post.getExcerpt());
        data.put("content", post.getContent());
        data.put("metaTitle", post.getMetaTitle());
        data.put("metaDesc", post.getMetaDesc());
        data.put("publishedAt", post.getPublishedAt());
        data.put("scheduledAt", post.getScheduledAt());
        data.put("createdAt", post.getCreatedAt());
        data.put("updatedAt", post.getUpdatedAt());
        data.put("isFeatured", post.getIsFeatured());
        if (post.getAuthor() != null) {
            data.put("authorId", post.getAuthor().getId());
        }
        if (post.getCategory() != null) {
            data.put("categoryId", post.getCategory().getId());
        }
        return data;
    }

    @SuppressWarnings("unchecked")
    private void applySnapshot(Post post, String snapshot) {
        try {
            java.util.Map<String, Object> data = objectMapper.readValue(snapshot, java.util.Map.class);
            if (data.get("slug") != null) post.setSlug((String) data.get("slug"));
            if (data.get("thumbnailUrl") != null) post.setThumbnailUrl((String) data.get("thumbnailUrl"));
            if (data.get("ogImageUrl") != null) post.setOgImageUrl((String) data.get("ogImageUrl"));
            if (data.get("status") != null) {
                post.setStatus(com.lawfirm.brs.constants.PostStatus.valueOf((String) data.get("status")));
            }
            if (data.get("scheduledAt") != null) {
                post.setScheduledAt(Instant.parse((String) data.get("scheduledAt")));
            }
            if (data.get("publishedAt") != null) {
                post.setPublishedAt(Instant.parse((String) data.get("publishedAt")));
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to apply post revision snapshot", e);
        }
    }

    private User loadUserRef(UUID id) {
        if (id == null) return null;
        // getReferenceById returns a managed Hibernate proxy carrying the
        // entity's @Version, so persisting PostRevision won't trigger
        // "uninitialized version value 'null'" on the transient User.
        return userRepository.getReferenceById(id);
    }

    /**
     * Export all posts as CSV.
     */
    @Transactional(readOnly = true)
    public String exportCsv() {
        List<Post> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        StringBuilder sb = new StringBuilder();
        sb.append("id,slug,status,views,author,category,language,createdAt,publishedAt\n");
        for (Post p : posts) {
            sb.append(escapeCsv(p.getId().toString())).append(',')
              .append(escapeCsv(p.getSlug() != null ? p.getSlug() : "")).append(',')
              .append(escapeCsv(p.getStatus() != null ? p.getStatus().name() : "")).append(',')
              .append(p.getViews() != null ? p.getViews() : 0).append(',')
              .append(escapeCsv(p.getAuthor() != null ? p.getAuthor().getFullName() : "")).append(',')
              .append(escapeCsv(p.getCategory() != null ? p.getCategory().getSlug() : "")).append(',')
              .append(escapeCsv(p.getLanguage() != null ? p.getLanguage() : "")).append(',')
              .append(escapeCsv(p.getCreatedAt() != null ? p.getCreatedAt().toString() : "")).append(',')
              .append(escapeCsv(p.getPublishedAt() != null ? p.getPublishedAt().toString() : ""))
              .append('\n');
        }
        return sb.toString();
    }

    private static String escapeCsv(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}

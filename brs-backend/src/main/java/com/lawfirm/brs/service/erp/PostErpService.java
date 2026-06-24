package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.PostStatus;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.entity.PostRevision;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.PostRepository;
import com.lawfirm.brs.repository.PostRevisionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    /**
     * Return version history for a post (most recent first).
     */
    @Transactional(readOnly = true)
    public PageResponse<PostDTO> revisions(UUID postId, int page, int size) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }
        Page<PostRevision> result = revisionRepository
            .findByPostIdOrderByRevisionNumberDesc(postId,
                PageRequest.of(page, size));
        List<PostDTO> dtos = result.getContent().stream()
            .map(this::revisionToDto)
            .toList();
        return PageResponse.of(dtos, page, size, result.getTotalElements());
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
            .editedBy(editorId == null ? null : buildUserRef(editorId))
            .changeNote(changeNote)
            .build();
        return revisionRepository.save(rev);
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

    private PostDTO revisionToDto(PostRevision rev) {
        // Render revisions as lightweight DTOs with metadata
        PostDTO dto = new PostDTO();
        dto.setId(rev.getId());
        dto.setSlug("revision-" + rev.getRevisionNumber());
        return dto;
    }

    private String toJson(Post post) {
        try {
            return objectMapper.writeValueAsString(post);
        } catch (Exception e) {
            log.warn("Snapshot serialization failed", e);
            return "{}";
        }
    }

    private static User buildUserRef(UUID id) {
        if (id == null) return null;
        User u = new User();
        u.setId(id);
        return u;
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

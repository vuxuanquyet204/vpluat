package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.PostRequest;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.*;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.*;
import com.lawfirm.brs.service.erp.PostErpService;
import com.lawfirm.brs.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Service for managing posts (admin-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PostManagementService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;
    private final PostErpService postErpService;

    @Transactional
    public PostDTO createPost(PostRequest request, UUID authorId) {
        log.info("Creating post: {}", request.title());

        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String slug = request.slug() != null ? request.slug() : SlugUtil.generate(request.title());

        Post post = Post.builder()
            .slug(slug)
            .title(request.title())
            .excerpt(request.excerpt())
            .content(request.content())
            .thumbnailUrl(request.thumbnailUrl())
            .metaTitle(request.metaTitle())
            .metaDesc(request.metaDesc())
            .author(author)
            .language(request.language() != null ? request.language() : "vi")
            .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
            .status(parseStatus(request.status()))
            .build();

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                .orElse(null);
            post.setCategory(category);
        }

        if (request.tags() != null && !request.tags().isEmpty()) {
            List<PostTag> postTags = new ArrayList<>();
            for (String tagSlug : request.tags()) {
                Tag tag = tagRepository.findBySlug(tagSlug).orElse(null);
                if (tag == null) {
                    tag = Tag.builder().slug(tagSlug).build();
                    tag = tagRepository.save(tag);
                }
                PostTag postTag = new PostTag();
                postTag.setPost(post);
                postTag.setTag(tag);
                postTags.add(postTag);
            }
            post.setPostTags(postTags);
        }

        post = postRepository.save(post);
        log.info("Created post: {}", post.getId());

        return postMapper.toDTO(post);
    }

    @Transactional
    public PostDTO updatePost(UUID id, PostRequest request) {
        log.info("Updating post: {}", id);

        // Eagerly load tags so the response after update carries the new tag list.
        Post post = postRepository.findByIdWithTags(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));

        if (request.slug() != null) {
            post.setSlug(request.slug());
        }
        if (request.title() != null) {
            post.setTitle(request.title());
        }
        if (request.excerpt() != null) {
            post.setExcerpt(request.excerpt());
        }
        if (request.content() != null) {
            post.setContent(request.content());
        }
        if (request.thumbnailUrl() != null) {
            post.setThumbnailUrl(request.thumbnailUrl());
        }
        if (request.metaTitle() != null) {
            post.setMetaTitle(request.metaTitle());
        }
        if (request.metaDesc() != null) {
            post.setMetaDesc(request.metaDesc());
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                .orElse(null);
            post.setCategory(category);
        }
        if (request.isFeatured() != null) {
            post.setIsFeatured(request.isFeatured());
        }
        if (request.ogImageUrl() != null) {
            post.setOgImageUrl(request.ogImageUrl());
        }
        if (request.status() != null) {
            post.setStatus(parseStatus(request.status()));
        }
        if (request.publishedAt() != null && !request.publishedAt().isBlank()) {
            post.setPublishedAt(parseInstant(request.publishedAt()));
        }
        if (request.scheduledAt() != null && !request.scheduledAt().isBlank()) {
            post.setScheduledAt(parseInstant(request.scheduledAt()));
        }

        // Tags: when the request explicitly carries a list, REPLACE the
        // existing join rows so the admin can both add and remove tags. An
        // absent field leaves the existing tags untouched.
        if (request.tags() != null) {
            // Clear current join rows (orphanRemoval = true on Post.postTags).
            post.getPostTags().clear();
            // Flush so DB-side FK rows are gone before we add the new ones,
            // otherwise Hibernate may try to insert duplicates.
            postRepository.flush();
            if (!request.tags().isEmpty()) {
                List<PostTag> postTags = new ArrayList<>();
                for (String tagSlug : request.tags()) {
                    Tag tag = tagRepository.findBySlug(tagSlug).orElse(null);
                    if (tag == null) {
                        tag = Tag.builder().slug(tagSlug).build();
                        tag = tagRepository.save(tag);
                    }
                    PostTag postTag = new PostTag();
                    postTag.setPost(post);
                    postTag.setTag(tag);
                    postTags.add(postTag);
                }
                post.getPostTags().addAll(postTags);
            }
        }

        post = postRepository.save(post);
        return postMapper.toDTOWithDetails(post);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "posts", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public PostDTO publishPost(UUID id) {
        log.info("Publishing post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.publish();
        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "posts", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public PostDTO archivePost(UUID id) {
        log.info("Archiving post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.archive();
        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "posts", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public PostDTO schedulePost(UUID id, Instant scheduledAt) {
        log.info("Scheduling post {} for {}", id, scheduledAt);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.schedule(scheduledAt);
        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "posts", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public void deletePost(UUID id) {
        log.info("Deleting post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        // Cascade revisions first to avoid orphan rows in post_revisions.
        postErpService.deleteRevisionsForPost(id);
        post.softDelete();
        postRepository.save(post);
    }

    public PostDTO getPostById(UUID id) {
        // Eagerly load the post + postTags + tags so the admin editor can
        // hydrate the form (title, excerpt, content, categoryId, tag slugs,
        // metaTitle/metaDesc, ogImageUrl, …) from the response.
        Post post = postRepository.findByIdWithTags(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        return postMapper.toDTOWithDetails(post);
    }

    public PageResponse<PostDTO> getAllPosts(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts;

        if (status != null && !status.isEmpty()) {
            posts = postRepository.findByStatusAndDeletedAtIsNullWithTags(
                parseStatus(status), pageable);
        } else {
            posts = postRepository.findAllByDeletedAtIsNullWithTags(pageable);
        }

        return PageResponse.of(
            postMapper.toDTOList(posts.getContent()),
            page,
            size,
            posts.getTotalElements()
        );
    }

    /**
     * Coerce a free-form status string (lowercase, mixed-case, hyphenated,
     * legacy spellings) into the canonical {@link com.lawfirm.brs.constants.PostStatus}
     * enum. Defaults to DRAFT for null/blank/unknown so admin clients that
     * drift from the contract never crash the request with a 500.
     */
    private com.lawfirm.brs.constants.PostStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return com.lawfirm.brs.constants.PostStatus.DRAFT;
        }
        String key = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        switch (key) {
            case "PUBLISH":
            case "PUBLISHED":
                return com.lawfirm.brs.constants.PostStatus.PUBLISHED;
            case "SCHEDULE":
            case "SCHEDULED":
                return com.lawfirm.brs.constants.PostStatus.SCHEDULED;
            case "ARCHIVE":
            case "ARCHIVED":
                return com.lawfirm.brs.constants.PostStatus.ARCHIVED;
            case "DRAFT":
                return com.lawfirm.brs.constants.PostStatus.DRAFT;
            default:
                log.warn("Unknown post status '{}', falling back to DRAFT", raw);
                return com.lawfirm.brs.constants.PostStatus.DRAFT;
        }
    }

    /**
     * Parse an ISO-8601 instant coming from the admin client. Both
     * `2025-08-22T00:00:00Z` and `2025-08-22T00:00:00.000Z` are accepted.
     * Returns null on parse failure (logged) so the caller keeps the prior
     * value rather than crashing with 500.
     */
    private Instant parseInstant(String raw) {
        try {
            return Instant.parse(raw);
        } catch (DateTimeParseException e) {
            log.warn("Cannot parse publishedAt/scheduledAt '{}', ignoring", raw);
            return null;
        }
    }
}

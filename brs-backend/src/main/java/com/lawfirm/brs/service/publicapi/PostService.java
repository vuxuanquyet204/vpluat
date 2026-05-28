package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing posts (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;

    @Cacheable(value = "posts", key = "'recent-' + #page + '-' + #size")
    public PageResponse<PostDTO> getPublishedPosts(int page, int size) {
        log.debug("Fetching published posts: page={}, size={}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findPublishedPosts(pageable);
        return PageResponse.of(
            postMapper.toDTOList(posts.getContent()),
            page,
            size,
            posts.getTotalElements()
        );
    }

    @Cacheable(value = "posts", key = "'featured'")
    public List<PostDTO> getFeaturedPosts() {
        log.debug("Fetching featured posts");
        return postMapper.toDTOList(postRepository.findFeaturedPublishedPosts());
    }

    @Cacheable(value = "posts", key = "#slug")
    public PostDTO getPostBySlug(String slug) {
        log.debug("Fetching post by slug: {}", slug);
        Post post = postRepository.findBySlugAndDeletedAtIsNull(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + slug));
        
        if (!post.isPublished()) {
            throw new ResourceNotFoundException("Post not found: " + slug);
        }
        
        return postMapper.toDTOWithDetails(post);
    }

    public PostDTO getPostById(UUID id) {
        log.debug("Fetching post by id: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        return postMapper.toDTOWithDetails(post);
    }

    public PageResponse<PostDTO> getPostsByCategory(UUID categoryId, int page, int size) {
        log.debug("Fetching posts by category: {}", categoryId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByCategoryIdAndDeletedAtIsNull(categoryId, pageable);
        return PageResponse.of(
            postMapper.toDTOList(posts.getContent()),
            page,
            size,
            posts.getTotalElements()
        );
    }

    public PageResponse<PostDTO> getPostsByTag(String tagSlug, int page, int size) {
        log.debug("Fetching posts by tag: {}", tagSlug);
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByTagSlugAndDeletedAtIsNull(tagSlug, pageable);
        return PageResponse.of(
            postMapper.toDTOList(posts.getContent()),
            page,
            size,
            posts.getTotalElements()
        );
    }

    public List<PostDTO> getRelatedPosts(UUID postId, int limit) {
        log.debug("Fetching related posts for: {}", postId);
        return postMapper.toDTOList(postRepository.findRelatedPosts(postId, PageRequest.of(0, limit)));
    }

    @Transactional
    public void incrementViews(UUID postId) {
        log.debug("Incrementing views for post: {}", postId);
        postRepository.findById(postId).ifPresent(Post::incrementViews);
    }
}

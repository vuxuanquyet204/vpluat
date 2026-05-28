package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.PostRequest;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.*;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.*;
import com.lawfirm.brs.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

    @Transactional
    public PostDTO createPost(PostRequest request, UUID authorId) {
        log.info("Creating post: {}", request.title());

        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String slug = request.slug() != null ? request.slug() : SlugUtil.generate(request.title());

        Post post = Post.builder()
            .slug(slug)
            .thumbnailUrl(request.thumbnailUrl())
            .author(author)
            .language(request.language() != null ? request.language() : "vi")
            .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
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

        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));

        if (request.slug() != null) {
            post.setSlug(request.slug());
        }
        if (request.thumbnailUrl() != null) {
            post.setThumbnailUrl(request.thumbnailUrl());
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

        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    public PostDTO publishPost(UUID id) {
        log.info("Publishing post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.publish();
        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    public PostDTO archivePost(UUID id) {
        log.info("Archiving post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.archive();
        post = postRepository.save(post);
        return postMapper.toDTO(post);
    }

    @Transactional
    public void deletePost(UUID id) {
        log.info("Deleting post: {}", id);
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        post.softDelete();
        postRepository.save(post);
    }

    public PostDTO getPostById(UUID id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
        return postMapper.toDTOWithDetails(post);
    }

    public PageResponse<PostDTO> getAllPosts(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts;

        if (status != null && !status.isEmpty()) {
            posts = postRepository.findByStatus(
                com.lawfirm.brs.constants.PostStatus.valueOf(status), pageable);
        } else {
            posts = postRepository.findAll(pageable);
        }

        return PageResponse.of(
            postMapper.toDTOList(posts.getContent()),
            page,
            size,
            posts.getTotalElements()
        );
    }
}

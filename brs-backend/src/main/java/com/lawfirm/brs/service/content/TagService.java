package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.TagRequest;
import com.lawfirm.brs.entity.Tag;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.jpa.TagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing tags (admin-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TagService {

    private final TagRepository tagRepository;

    @Transactional
    public Tag createTag(TagRequest request) {
        log.info("Creating tag: {}", request.slug());

        if (tagRepository.findBySlug(request.slug()).isPresent()) {
            throw new BusinessException("DUPLICATE_VALUE", "Tag with this slug already exists");
        }

        Tag tag = Tag.builder()
            .slug(request.slug())
            .build();

        tag = tagRepository.save(tag);
        return tag;
    }

    public Tag getTagBySlug(String slug) {
        return tagRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + slug));
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public void deleteTag(String slug) {
        log.info("Deleting tag: {}", slug);
        Tag tag = tagRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + slug));
        tagRepository.delete(tag);
    }
}

package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.CategoryRequest;
import com.lawfirm.brs.dto.response.CategoryDTO;
import com.lawfirm.brs.entity.Category;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.CategoryMapper;
import com.lawfirm.brs.repository.CategoryRepository;
import com.lawfirm.brs.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing categories (admin-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final CategoryMapper categoryMapper;

    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        log.info("Creating category: {}", request.slug());

        if (categoryRepository.findBySlug(request.slug()).isPresent()) {
            throw new BusinessException("DUPLICATE_VALUE", "Category with this slug already exists");
        }

        Category category = Category.builder()
            .slug(request.slug())
            .metaTitleVi(request.metaTitleVi())
            .metaTitleEn(request.metaTitleEn())
            .metaDescVi(request.metaDescVi())
            .metaDescEn(request.metaDescEn())
            .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
            .build();

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(UUID.fromString(request.parentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(UUID id, CategoryRequest request) {
        log.info("Updating category: {}", id);

        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        if (request.metaTitleVi() != null) category.setMetaTitleVi(request.metaTitleVi());
        if (request.metaTitleEn() != null) category.setMetaTitleEn(request.metaTitleEn());
        if (request.metaDescVi() != null) category.setMetaDescVi(request.metaDescVi());
        if (request.metaDescEn() != null) category.setMetaDescEn(request.metaDescEn());
        if (request.displayOrder() != null) category.setDisplayOrder(request.displayOrder());

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(UUID.fromString(request.parentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        return categoryMapper.toDTO(category);
    }

    public CategoryDTO getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        return categoryMapper.toDTO(category);
    }

    public List<CategoryDTO> getAllCategories() {
        return withPostCounts(categoryMapper.toDTOList(categoryRepository.findAll()));
    }

    public List<CategoryDTO> getRootCategories() {
        return withPostCounts(categoryMapper.toDTOList(categoryRepository.findRootCategories()));
    }

    /**
     * Stamp {@code name}, {@code description} (derived from localised meta
     * variants) and {@code postCount} on each DTO so the admin UI can render
     * name/description columns and disable delete buttons for categories that
     * still own posts. The frontend otherwise has to N+1 the posts endpoint.
     */
    private List<CategoryDTO> withPostCounts(List<CategoryDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return dtos;
        for (CategoryDTO dto : dtos) {
            if (dto == null) continue;
            dto.setName(firstNonBlank(dto.getMetaTitleVi(), dto.getMetaTitleEn(), dto.getSlug()));
            dto.setDescription(firstNonBlank(dto.getMetaDescVi(), dto.getMetaDescEn()));
            if (dto.getId() == null) {
                dto.setPostCount(0);
                continue;
            }
            try {
                dto.setPostCount((int) postRepository.countByCategoryId(dto.getId()));
            } catch (Exception ex) {
                log.warn("Failed to count posts for category {}: {}", dto.getId(), ex.getMessage());
                dto.setPostCount(0);
            }
        }
        return dtos;
    }

    private static String firstNonBlank(String... candidates) {
        if (candidates == null) return null;
        for (String c : candidates) {
            if (c != null && !c.isBlank()) return c;
        }
        return null;
    }

    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting category: {}", id);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
    }
}

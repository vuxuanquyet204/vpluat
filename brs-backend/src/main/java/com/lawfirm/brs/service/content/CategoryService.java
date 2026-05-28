package com.lawfirm.brs.service.content;

import com.lawfirm.brs.dto.request.CategoryRequest;
import com.lawfirm.brs.dto.response.CategoryDTO;
import com.lawfirm.brs.entity.Category;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.CategoryMapper;
import com.lawfirm.brs.repository.jpa.CategoryRepository;
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
        return categoryMapper.toDTOList(categoryRepository.findAll());
    }

    public List<CategoryDTO> getRootCategories() {
        return categoryMapper.toDTOList(categoryRepository.findRootCategories());
    }

    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting category: {}", id);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        categoryRepository.delete(category);
    }
}

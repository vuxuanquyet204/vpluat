package com.lawfirm.brs.controller.content;

import com.lawfirm.brs.dto.request.CategoryRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.CategoryDTO;
import com.lawfirm.brs.service.content.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for category management (admin).
 */
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@Tag(name = "Admin - Categories", description = "Category management endpoints")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryDTO category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", category));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryDTO category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategory(@PathVariable UUID id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/root")
    @Operation(summary = "Get root categories")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getRootCategories() {
        List<CategoryDTO> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}

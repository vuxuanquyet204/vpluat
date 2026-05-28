package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.request.TagRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.entity.Tag;
import com.lawfirm.brs.service.content.TagService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tags")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
public class TagController {

    private final TagService tagService;

    @PostMapping
    @Operation(summary = "Create a new tag")
    public ResponseEntity<ApiResponse<Tag>> createTag(@Valid @RequestBody TagRequest request) {
        Tag tag = tagService.createTag(request);
        return ResponseEntity.ok(ApiResponse.success("Tag created successfully", tag));
    }

    @GetMapping
    @Operation(summary = "Get all tags")
    public ResponseEntity<ApiResponse<List<Tag>>> getAllTags() {
        List<Tag> tags = tagService.getAllTags();
        return ResponseEntity.ok(ApiResponse.success(tags));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get tag by slug")
    public ResponseEntity<ApiResponse<Tag>> getTag(@PathVariable String slug) {
        Tag tag = tagService.getTagBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(tag));
    }

    @DeleteMapping("/{slug}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a tag")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable String slug) {
        tagService.deleteTag(slug);
        return ResponseEntity.ok(ApiResponse.success("Tag deleted successfully", null));
    }
}

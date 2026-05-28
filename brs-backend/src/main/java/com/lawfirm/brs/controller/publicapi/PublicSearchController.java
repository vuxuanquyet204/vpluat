package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.SearchResultDTO;
import com.lawfirm.brs.service.publicapi.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public controller for search.
 */
@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
@Tag(name = "Public - Search", description = "Public endpoints for full-text search")
public class PublicSearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search across all content")
    public ResponseEntity<ApiResponse<List<SearchResultDTO>>> search(
            @RequestParam String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "vi") String language) {
        List<SearchResultDTO> results = searchService.search(query, type, language);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}

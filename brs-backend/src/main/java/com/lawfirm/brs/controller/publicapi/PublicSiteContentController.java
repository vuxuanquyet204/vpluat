package com.lawfirm.brs.controller.publicapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.service.publicapi.PublicSiteContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/site-content")
@RequiredArgsConstructor
@Tag(name = "Public - Site content", description = "Public firm profile and site content")
public class PublicSiteContentController {
    private final PublicSiteContentService contentService;

    @GetMapping
    @Operation(summary = "Get public site content")
    public ResponseEntity<ApiResponse<JsonNode>> get(@RequestParam(defaultValue = "vi") String locale) {
        return ResponseEntity.ok(ApiResponse.success(contentService.get(locale)));
    }
}

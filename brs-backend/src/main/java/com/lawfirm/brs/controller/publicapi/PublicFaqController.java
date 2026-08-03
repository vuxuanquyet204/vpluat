package com.lawfirm.brs.controller.publicapi;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.FaqDTO;
import com.lawfirm.brs.service.publicapi.FaqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public controller for FAQs.
 */
@RestController
@RequestMapping("/api/public/faqs")
@RequiredArgsConstructor
@Tag(name = "Public - FAQs", description = "Public endpoints for FAQs")
public class PublicFaqController {

    private final FaqService faqService;

    @GetMapping
    @Operation(summary = "Get all published FAQs")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getAllFaqs(
            @RequestParam(defaultValue = "vi") String locale) {
        List<FaqDTO> faqs = faqService.getPublishedFaqs(locale);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured FAQs")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFeaturedFaqs(
            @RequestParam(defaultValue = "vi") String locale) {
        List<FaqDTO> faqs = faqService.getFeaturedFaqs(locale);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get FAQs by service")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFaqsByService(
            @PathVariable UUID serviceId,
            @RequestParam(defaultValue = "vi") String locale) {
        List<FaqDTO> faqs = faqService.getFaqsByService(serviceId, locale);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FAQ by ID")
    public ResponseEntity<ApiResponse<FaqDTO>> getFaqById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "vi") String locale) {
        FaqDTO faq = faqService.getFaqById(id, locale);
        return ResponseEntity.ok(ApiResponse.success(faq));
    }
}

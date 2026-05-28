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
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getAllFaqs() {
        List<FaqDTO> faqs = faqService.getPublishedFaqs();
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured FAQs")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFeaturedFaqs() {
        List<FaqDTO> faqs = faqService.getFeaturedFaqs();
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get FAQs by service")
    public ResponseEntity<ApiResponse<List<FaqDTO>>> getFaqsByService(@PathVariable UUID serviceId) {
        List<FaqDTO> faqs = faqService.getFaqsByService(serviceId);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get FAQ by ID")
    public ResponseEntity<ApiResponse<FaqDTO>> getFaqById(@PathVariable UUID id) {
        FaqDTO faq = faqService.getFaqById(id);
        return ResponseEntity.ok(ApiResponse.success(faq));
    }
}

package com.lawfirm.brs.controller.admin;

import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.NewsletterSubscriber;
import com.lawfirm.brs.repository.NewsletterSubscriberRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Admin endpoints for newsletter subscriber management.
 */
@RestController
@RequestMapping("/api/admin/newsletter")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('EDITOR')")
@Tag(name = "Admin - Newsletter", description = "Admin subscriber management")
public class AdminNewsletterController {

    private final NewsletterSubscriberRepository subscriberRepository;

    @GetMapping("/subscribers")
    @Operation(summary = "List newsletter subscribers")
    public ResponseEntity<ApiResponse<PageResponse<NewsletterSubscriber>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                Math.min(Math.max(1, size), 200),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<NewsletterSubscriber> result = (status == null || status.isBlank())
                ? subscriberRepository.findAll(pageable)
                : subscriberRepository.findByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @PatchMapping("/subscribers/{id}/unsubscribe")
    @Operation(summary = "Unsubscribe by id (admin)")
    public ResponseEntity<ApiResponse<NewsletterSubscriber>> unsubscribeById(@PathVariable UUID id) {
        NewsletterSubscriber subscriber = subscriberRepository.findById(id)
                .orElseThrow(() -> new com.lawfirm.brs.exception.ResourceNotFoundException(
                        "Subscriber not found: " + id));
        subscriber.setStatus("UNSUBSCRIBED");
        subscriber.setUnsubscribedAt(Instant.now());
        subscriberRepository.save(subscriber);
        log.info("Admin unsubscribed subscriber id={}", id);
        return ResponseEntity.ok(ApiResponse.success(subscriber));
    }

    @PatchMapping("/subscribers/unsubscribe")
    @Operation(summary = "Unsubscribe by email (admin)")
    public ResponseEntity<ApiResponse<NewsletterSubscriber>> unsubscribeByEmail(
            @RequestBody Map<String, String> body
    ) {
        String email = body == null ? null : body.get("email");
        if (email == null || email.isBlank()) {
            throw new com.lawfirm.brs.exception.BusinessException(
                    "MISSING_EMAIL", "Email is required");
        }
        NewsletterSubscriber subscriber = subscriberRepository.findByEmail(email.trim())
                .orElseThrow(() -> new com.lawfirm.brs.exception.ResourceNotFoundException(
                        "Subscriber not found: " + email));
        subscriber.setStatus("UNSUBSCRIBED");
        subscriber.setUnsubscribedAt(Instant.now());
        subscriberRepository.save(subscriber);
        log.info("Admin unsubscribed subscriber email={}", email);
        return ResponseEntity.ok(ApiResponse.success(subscriber));
    }

    @PatchMapping("/subscribers/{id}/reactivate")
    @Operation(summary = "Re-activate an unsubscribed subscriber")
    public ResponseEntity<ApiResponse<NewsletterSubscriber>> reactivate(@PathVariable UUID id) {
        NewsletterSubscriber subscriber = subscriberRepository.findById(id)
                .orElseThrow(() -> new com.lawfirm.brs.exception.ResourceNotFoundException(
                        "Subscriber not found: " + id));
        subscriber.setStatus("ACTIVE");
        subscriber.setUnsubscribedAt(null);
        subscriberRepository.save(subscriber);
        log.info("Admin reactivated subscriber id={}", id);
        return ResponseEntity.ok(ApiResponse.success(subscriber));
    }

    @PostMapping("/subscribers")
    @Operation(summary = "Create a subscriber manually (admin)")
    public ResponseEntity<ApiResponse<NewsletterSubscriber>> create(
            @RequestBody Map<String, String> body
    ) {
        String email = body == null ? null : body.get("email");
        String name = body == null ? null : body.get("name");
        String source = body == null ? null : body.get("source");
        if (email == null || email.isBlank()) {
            throw new com.lawfirm.brs.exception.BusinessException(
                    "MISSING_EMAIL", "Email is required");
        }
        String normalized = email.trim().toLowerCase();
        // Reject duplicates - if exists, re-activate only if previously unsubscribed
        final String finalName = (name == null || name.isBlank()) ? null : name.trim();
        final String finalSource = (source == null || source.isBlank()) ? "ADMIN" : source.trim();
        NewsletterSubscriber saved = subscriberRepository.findByEmail(normalized)
                .map(existing -> {
                    existing.setStatus("ACTIVE");
                    existing.setUnsubscribedAt(null);
                    existing.setVerifiedAt(java.time.Instant.now());
                    if (finalName != null) existing.setName(finalName);
                    existing.setSource(finalSource);
                    return subscriberRepository.save(existing);
                })
                .orElseGet(() -> {
                    NewsletterSubscriber s = NewsletterSubscriber.builder()
                            .email(normalized)
                            .name(finalName)
                            .source(finalSource)
                            .status("ACTIVE")
                            .verifiedAt(java.time.Instant.now())
                            .build();
                    return subscriberRepository.save(s);
                });
        log.info("Admin created/re-activated subscriber email={}", normalized);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @DeleteMapping("/subscribers/{id}")
    @Operation(summary = "Hard-delete subscriber by id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        if (!subscriberRepository.existsById(id)) {
            throw new com.lawfirm.brs.exception.ResourceNotFoundException(
                    "Subscriber not found: " + id);
        }
        subscriberRepository.deleteById(id);
        log.info("Admin deleted subscriber id={}", id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/subscribers/count")
    @Operation(summary = "Total subscriber counts by status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> counts() {
        Map<String, Long> out = Map.of(
                "active", subscriberRepository.countByStatus("ACTIVE"),
                "pending", subscriberRepository.countByStatus("PENDING"),
                "unsubscribed", subscriberRepository.countByStatus("UNSUBSCRIBED"),
                "bounced", subscriberRepository.countByStatus("BOUNCED")
        );
        return ResponseEntity.ok(ApiResponse.success(out));
    }
}
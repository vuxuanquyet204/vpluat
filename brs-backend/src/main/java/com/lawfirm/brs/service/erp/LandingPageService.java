package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.LandingPage;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.LandingPageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LandingPageService {
    private final LandingPageRepository repository;

    @Transactional(readOnly = true)
    public PageResponse<LandingPage> list(int page, int size) {
        Page<LandingPage> result = repository.findAll(
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));
        return PageResponse.of(result.getContent(), page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public LandingPage get(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Landing page not found: " + id));
    }

    public LandingPage create(String titleVi, String titleEn, String slug, String contentJson) {
        LandingPage lp = LandingPage.builder()
            .titleVi(titleVi)
            .titleEn(titleEn)
            .slug(slug)
            .content(contentJson != null ? contentJson : "{}")
            .isPublished(false)
            .visitCount(0)
            .conversionCount(0)
            .build();
        return repository.save(lp);
    }

    public LandingPage update(UUID id, String titleVi, String titleEn, String contentJson, Boolean isPublished) {
        LandingPage lp = get(id);
        if (titleVi != null) lp.setTitleVi(titleVi);
        if (titleEn != null) lp.setTitleEn(titleEn);
        if (contentJson != null) lp.setContent(contentJson);
        if (isPublished != null) lp.setIsPublished(isPublished);
        return repository.save(lp);
    }

    public void delete(UUID id) { repository.deleteById(id); }

    @Transactional(readOnly = true)
    public Map<String, Object> stats(UUID id) {
        LandingPage lp = get(id);
        int visits = lp.getVisitCount() == null ? 0 : lp.getVisitCount();
        int conv = lp.getConversionCount() == null ? 0 : lp.getConversionCount();
        double rate = visits == 0 ? 0.0 : Math.round(conv * 10000.0 / visits) / 100.0;
        return Map.of(
            "id", lp.getId(),
            "slug", lp.getSlug() == null ? "" : lp.getSlug(),
            "title", lp.getTitleVi() != null ? lp.getTitleVi() : (lp.getTitleEn() != null ? lp.getTitleEn() : ""),
            "visitCount", visits,
            "conversionCount", conv,
            "conversionRate", rate
        );
    }
}
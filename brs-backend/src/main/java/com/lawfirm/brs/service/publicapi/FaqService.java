package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.FaqDTO;
import com.lawfirm.brs.entity.Faq;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.FaqMapper;
import com.lawfirm.brs.repository.jpa.FaqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing FAQs (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqMapper faqMapper;

    @Cacheable(value = "faqs", key = "'all-published'")
    public List<FaqDTO> getPublishedFaqs() {
        log.debug("Fetching all published FAQs");
        return faqMapper.toDTOList(faqRepository.findByIsPublishedTrueOrderByDisplayOrder());
    }

    @Cacheable(value = "faqs", key = "'service-' + #serviceId")
    public List<FaqDTO> getFaqsByService(UUID serviceId) {
        log.debug("Fetching FAQs by service: {}", serviceId);
        return faqMapper.toDTOList(faqRepository.findByServiceIdAndIsPublishedTrueOrderByDisplayOrder(serviceId));
    }

    public FaqDTO getFaqById(UUID id) {
        log.debug("Fetching FAQ by id: {}", id);
        Faq faq = faqRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FAQ not found: " + id));
        return faqMapper.toDTOWithDetails(faq);
    }

    public List<FaqDTO> getFeaturedFaqs() {
        log.debug("Fetching featured FAQs");
        // For now, return all published FAQs
        // Could be extended to have a featured flag
        return faqMapper.toDTOList(faqRepository.findByIsPublishedTrueOrderByDisplayOrder());
    }
}

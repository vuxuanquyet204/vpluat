package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.SearchResultDTO;
import com.lawfirm.brs.entity.*;
import com.lawfirm.brs.mapper.ServiceEntityMapper;
import com.lawfirm.brs.mapper.LawyerMapper;
import com.lawfirm.brs.mapper.PostMapper;
import com.lawfirm.brs.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for full-text search across entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SearchService {

    private final ServiceEntityRepository serviceRepository;
    private final LawyerProfileRepository lawyerRepository;
    private final PostRepository postRepository;
    private final FaqRepository faqRepository;
    private final ServiceEntityMapper serviceMapper;
    private final LawyerMapper lawyerMapper;
    private final PostMapper postMapper;

    @Cacheable(value = "search", key = "#query + '-' + #type + '-' + #language")
    public List<SearchResultDTO> search(String query, String type, String language) {
        log.debug("Searching: query={}, type={}, language={}", query, type, language);
        
        List<SearchResultDTO> results = new ArrayList<>();
        int limit = 10;

        if (type == null || "service".equals(type)) {
            results.addAll(searchServices(query, language, limit));
        }
        if (type == null || "lawyer".equals(type)) {
            results.addAll(searchLawyers(query, language, limit));
        }
        if (type == null || "post".equals(type)) {
            results.addAll(searchPosts(query, language, limit));
        }
        if (type == null || "faq".equals(type)) {
            results.addAll(searchFaqs(query, language, limit));
        }

        return results;
    }

    private List<SearchResultDTO> searchServices(String query, String language, int limit) {
        List<SearchResultDTO> results = new ArrayList<>();
        serviceRepository.searchServices(query, PageRequest.of(0, limit))
            .forEach(service -> {
                String title = service.getSlug();
                results.add(SearchResultDTO.ofService(
                    service.getId().toString(),
                    title,
                    title,
                    service.getSlug()
                ));
            });
        return results;
    }

    private List<SearchResultDTO> searchLawyers(String query, String language, int limit) {
        List<SearchResultDTO> results = new ArrayList<>();
        lawyerRepository.searchByName(query)
            .stream()
            .limit(limit)
            .forEach(lawyer -> {
                String name = "vi".equals(language) ? lawyer.getNameVi() : lawyer.getNameEn();
                if (name == null) name = lawyer.getNameVi();
                results.add(SearchResultDTO.ofLawyer(
                    lawyer.getId().toString(),
                    name,
                    name,
                    lawyer.getSlug()
                ));
            });
        return results;
    }

    private List<SearchResultDTO> searchPosts(String query, String language, int limit) {
        List<SearchResultDTO> results = new ArrayList<>();
        postRepository.searchPosts(query, language, PageRequest.of(0, limit))
            .forEach(post -> results.add(SearchResultDTO.ofPost(
                post.getId().toString(),
                post.getSlug(),
                post.getSlug(),
                post.getSlug()
            )));
        return results;
    }

    private List<SearchResultDTO> searchFaqs(String query, String language, int limit) {
        List<SearchResultDTO> results = new ArrayList<>();
        faqRepository.findByIsPublishedTrueOrderByDisplayOrder()
            .stream()
            .limit(limit)
            .forEach(faq -> results.add(SearchResultDTO.ofFaq(
                faq.getId().toString(),
                faq.getId().toString(),
                faq.getId().toString()
            )));
        return results;
    }
}

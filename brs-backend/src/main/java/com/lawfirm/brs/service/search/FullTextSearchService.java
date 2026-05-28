package com.lawfirm.brs.service.search;

import com.lawfirm.brs.dto.response.SearchResultDTO;
import com.lawfirm.brs.entity.Faq;
import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.repository.FaqRepository;
import com.lawfirm.brs.repository.PostRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for full-text search across posts, services, and FAQs.
 * Uses PostgreSQL GIN indexes for optimized full-text search.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FullTextSearchService {

    private final PostRepository postRepository;
    private final ServiceEntityRepository serviceRepository;
    private final FaqRepository faqRepository;

    /**
     * Search across multiple entity types
     */
    public List<SearchResultDTO> search(String query, List<String> entities) {
        log.info("Searching for: '{}', entities: {}", query, entities);

        if (query == null || query.isBlank()) {
            return List.of();
        }

        List<SearchResultDTO> results = new ArrayList<>();

        // Determine which entities to search
        boolean searchPosts = entities == null || entities.contains("posts");
        boolean searchServices = entities == null || entities.contains("services");
        boolean searchFaqs = entities == null || entities.contains("faqs");

        if (searchPosts) {
            results.addAll(searchPosts(query));
        }
        if (searchServices) {
            results.addAll(searchServices(query));
        }
        if (searchFaqs) {
            results.addAll(searchFaqs(query));
        }

        // Sort by relevance score (if available)
        results.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        log.info("Found {} results for query: '{}'", results.size(), query);
        return results;
    }

    /**
     * Search only posts
     */
    public List<SearchResultDTO> searchPosts(String query) {
        log.debug("Searching posts: {}", query);
        return postRepository.searchByQuery(query).stream()
            .map(this::toSearchResult)
            .toList();
    }

    /**
     * Search only services
     */
    public List<SearchResultDTO> searchServices(String query) {
        log.debug("Searching services: {}", query);
        return serviceRepository.searchByQuery(query).stream()
            .map(this::toSearchResult)
            .toList();
    }

    /**
     * Search only FAQs
     */
    public List<SearchResultDTO> searchFaqs(String query) {
        log.debug("Searching FAQs: {}", query);
        return faqRepository.searchByQuery(query).stream()
            .map(this::toSearchResult)
            .toList();
    }

    /**
     * Search with highlighting
     */
    public List<SearchResultDTO> searchWithHighlight(String query, List<String> entities) {
        List<SearchResultDTO> results = search(query, entities);

        // Add highlighting to matching content
        for (SearchResultDTO result : results) {
            if (result.getContent() != null) {
                result.setContent(highlightMatches(result.getContent(), query));
            }
        }

        return results;
    }

    /**
     * Get search suggestions based on partial query
     */
    public List<String> getSuggestions(String query, int limit) {
        log.debug("Getting suggestions for: {}", query);
        // This would typically use PostgreSQL trigram similarity or prefix matching
        List<String> suggestions = new ArrayList<>();

        // Get matching post titles
        postRepository.findAll().stream()
            .filter(p -> p.getSlug() != null && p.getSlug().toLowerCase().contains(query.toLowerCase()))
            .limit(limit)
            .forEach(p -> suggestions.add(p.getSlug()));

        // Get matching service slugs
        serviceRepository.findAll().stream()
            .filter(s -> s.getSlug() != null && s.getSlug().toLowerCase().contains(query.toLowerCase()))
            .limit(limit)
            .forEach(s -> suggestions.add(s.getSlug()));

        return suggestions.stream().distinct().limit(limit).toList();
    }

    private SearchResultDTO toSearchResult(Post post) {
        return SearchResultDTO.builder()
            .id(post.getId().toString())
            .type("post")
            .title(post.getSlug())
            .excerpt(post.getSlug())  // Use slug as excerpt for posts
            .url("/blog/" + post.getSlug())
            .score(1.0) // Default score, can be improved with PostgreSQL ts_rank
            .build();
    }

    private SearchResultDTO toSearchResult(ServiceEntity service) {
        return SearchResultDTO.builder()
            .id(service.getId().toString())
            .type("service")
            .title(service.getSlug())
            .excerpt(service.getSlug())  // ServiceEntity has slug field
            .url("/services/" + service.getSlug())
            .score(1.0)
            .build();
    }

    private SearchResultDTO toSearchResult(Faq faq) {
        return SearchResultDTO.builder()
            .id(faq.getId().toString())
            .type("faq")
            .title(faq.getService() != null ? faq.getService().getSlug() : "General")
            .excerpt(null) // Content is typically in locale tables
            .url("/faq#" + faq.getId())
            .score(1.0)
            .build();
    }

    private String highlightMatches(String content, String query) {
        if (content == null || query == null) {
            return content;
        }

        String[] words = query.toLowerCase().split("\\s+");
        String result = content;

        for (String word : words) {
            if (word.length() > 2) {
                result = result.replaceAll(
                    "(?i)(" + java.util.regex.Pattern.quote(word) + ")",
                    "<mark>$1</mark>"
                );
            }
        }

        return result;
    }
}

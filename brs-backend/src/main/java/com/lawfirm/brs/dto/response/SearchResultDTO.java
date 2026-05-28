package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Search Result DTO for full-text search responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {

    private String type;  // service, lawyer, post, faq
    private String id;
    private String title;
    private String excerpt;
    private String content;  // Full content for display
    private String slug;
    private String url;
    private Double score;
    private Map<String, Object> highlights;

    public static SearchResultDTO ofService(String id, String title, String excerpt, String slug) {
        return SearchResultDTO.builder()
            .type("service")
            .id(id)
            .title(title)
            .excerpt(excerpt)
            .slug(slug)
            .url("/services/" + slug)
            .build();
    }

    public static SearchResultDTO ofLawyer(String id, String title, String excerpt, String slug) {
        return SearchResultDTO.builder()
            .type("lawyer")
            .id(id)
            .title(title)
            .excerpt(excerpt)
            .slug(slug)
            .url("/lawyers/" + slug)
            .build();
    }

    public static SearchResultDTO ofPost(String id, String title, String excerpt, String slug) {
        return SearchResultDTO.builder()
            .type("post")
            .id(id)
            .title(title)
            .excerpt(excerpt)
            .slug(slug)
            .url("/blog/" + slug)
            .build();
    }

    public static SearchResultDTO ofFaq(String id, String title, String excerpt) {
        return SearchResultDTO.builder()
            .type("faq")
            .id(id)
            .title(title)
            .excerpt(excerpt)
            .build();
    }
}

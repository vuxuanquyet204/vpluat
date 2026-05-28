package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Search request DTO.
 */
public record SearchRequest(
    @NotBlank(message = "Query is required")
    @Size(max = 500, message = "Query is too long")
    String query,

    @Size(max = 100, message = "Type filter is too long")
    String type,

    @Size(max = 50, message = "Language is too long")
    String language,

    @Min(value = 0)
    Integer page,

    @Min(value = 1)
    @Max(value = 50)
    Integer size
) {
    public SearchRequest {
        if (page == null) page = 0;
        if (size == null) size = 20;
        if (language == null) language = "vi";
    }
}

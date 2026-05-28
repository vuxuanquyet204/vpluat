package com.lawfirm.brs.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * Pagination request parameters.
 */
public record PaginationRequest(
    @Min(value = 0, message = "Page must be non-negative")
    Integer page,

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size cannot exceed 100")
    Integer size,

    String sort,

    String direction
) {
    public PaginationRequest {
        if (page == null) page = 0;
        if (size == null) size = 20;
        if (direction == null) direction = "desc";
    }

    public int getOffset() {
        return page * size;
    }
}

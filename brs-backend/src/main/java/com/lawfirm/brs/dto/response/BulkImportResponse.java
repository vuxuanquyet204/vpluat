package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Result of a bulk CSV import job.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkImportResponse {
    private UUID importId;
    private int totalRows;
    private int importedCount;
    private int failedCount;
    private List<String> errors;
}

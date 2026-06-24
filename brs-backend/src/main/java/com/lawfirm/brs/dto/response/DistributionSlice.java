package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One slice of a service-distribution or source-distribution pie chart.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributionSlice {
    private String label;
    private long count;
    private double percentage;
}

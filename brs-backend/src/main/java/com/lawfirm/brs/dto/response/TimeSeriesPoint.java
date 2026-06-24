package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Single point on a time-series chart.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesPoint {
    private LocalDate date;
    private long value;
    private String label;
}

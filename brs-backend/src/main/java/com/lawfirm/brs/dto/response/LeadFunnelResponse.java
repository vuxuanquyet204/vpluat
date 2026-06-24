package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lead conversion funnel: total -> contacted -> qualified -> converted.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadFunnelResponse {
    private long total;
    private long contacted;
    private long qualified;
    private long converted;
    private double conversionRate;
}

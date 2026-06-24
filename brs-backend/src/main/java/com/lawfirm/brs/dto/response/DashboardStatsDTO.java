package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Dashboard statistics DTO for admin dashboard.
 * Backwards-compatible: existing fields preserved, new ERP-specific
 * fields added with default zero/null so old clients keep working.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Legacy / top-level counters
    private long totalLeads;
    private long newLeads;
    private long convertedLeads;
    private long totalAppointments;
    private long pendingAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long totalPosts;
    private long publishedPosts;
    private long totalReviews;
    private long pendingReviews;
    private long newsletterSubscribers;
    private long jobApplications;
    private WeeklyStats weeklyLeads;
    private WeeklyStats weeklyAppointments;

    // ERP extension fields (Phase 7 dashboard)
    private int appointmentsToday;
    private int appointmentsChange;
    private int leadsInRange;
    private int leadsChange;
    private BigDecimal conversionRate;
    private BigDecimal conversionChange;
    private int chatbotConversations;
    private int chatbotChange;
    private int pendingCount;
    private int cancelledToday;
    private int completedToday;
    private BigDecimal revenue;
    private BigDecimal revenueChange;
    private BigDecimal reviewsAvgRating;
    private int reviewsPending;
    private String range;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStats {
        private long[] data;
        private String[] labels;
    }
}

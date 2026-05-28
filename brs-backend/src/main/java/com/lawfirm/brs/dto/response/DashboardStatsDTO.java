package com.lawfirm.brs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Dashboard Statistics DTO for admin dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyStats {
        private long[] data;
        private String[] labels;
    }
}

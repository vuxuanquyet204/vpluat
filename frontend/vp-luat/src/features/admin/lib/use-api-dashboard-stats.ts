/**
 * Hooks for admin dashboard that pull from the real BRS backend.
 * Drop-in replacement for the MockDB-based useDashboardStats hook.
 */
'use client';

import { useApiQuery } from '@/lib/api';
import { adminDashboardApi, type DashboardStats, type TimeSeriesPoint, type DistributionSlice, type LeadFunnel, type ActivityLog } from '@/lib/api/admin-dashboard';

export function useDashboardStats(range: string = 'week') {
  return useApiQuery<DashboardStats>(
    ['admin', 'dashboard', 'stats', range],
    '/admin/dashboard/stats/range',
    { range },
    { refetchInterval: 30_000 },
  );
}

export function useDashboardVisitors(days: number = 30) {
  return useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'visitors', days],
    '/admin/dashboard/charts/visitors',
    { days },
    { refetchInterval: 60_000 },
  );
}

export function useServiceDistribution(range: string = 'week') {
  return useApiQuery<DistributionSlice[]>(
    ['admin', 'dashboard', 'service-distribution', range],
    '/admin/dashboard/charts/service-distribution',
    { range },
    { refetchInterval: 60_000 },
  );
}

export function useLeadFunnel(range: string = 'week') {
  return useApiQuery<LeadFunnel>(
    ['admin', 'dashboard', 'lead-funnel', range],
    '/admin/dashboard/charts/lead-funnel',
    { range },
    { refetchInterval: 60_000 },
  );
}

export function useDashboardRevenue(range: string = 'month') {
  return useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'revenue', range],
    '/admin/dashboard/charts/revenue',
    { range },
    { refetchInterval: 60_000 },
  );
}

export function useDashboardActivity(limit: number = 20) {
  return useApiQuery<ActivityLog[]>(
    ['admin', 'dashboard', 'activity', limit],
    '/admin/dashboard/activity',
    { limit },
    { refetchInterval: 15_000 },
  );
}

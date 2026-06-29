/**
 * Drop-in replacement for the legacy `useDashboardStats` hook.
 * Returns the same flat shape that the dashboard page consumes,
 * but pulls values from the real BRS backend instead of MockDB.
 *
 * To enable, change the import in dashboard/index.tsx from:
 *   import { useDashboardStats } from '@/features/admin/lib/use-dashboard-stats';
 * to:
 *   import { useDashboardStats } from '@/features/admin/lib/use-dashboard-stats-api';
 */
'use client';

import { useApiQuery } from '@/lib/api';

export type DashboardRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardStats {
  appointments_today: number;
  appointments_change: number;
  leads_in_range: number;
  leads_change: number;
  conversion_rate: number;
  conversion_change: number;
  chatbot_conversations: number;
  chatbot_change: number;
  pending_count: number;
  cancelled_count: number;
  completed_today: number;
  reviews_avg_rating: number;
  reviews_pending: number;
  revenue: number;
  revenue_change: number;
  range?: string;
}

const EMPTY_STATS: DashboardStats = {
  appointments_today: 0,
  appointments_change: 0,
  leads_in_range: 0,
  leads_change: 0,
  conversion_rate: 0,
  conversion_change: 0,
  chatbot_conversations: 0,
  chatbot_change: 0,
  pending_count: 0,
  cancelled_count: 0,
  completed_today: 0,
  reviews_avg_rating: 0,
  reviews_pending: 0,
  revenue: 0,
  revenue_change: 0,
};

export function useDashboardStats(range: DashboardRange = 'week'): DashboardStats {
  const { data } = useApiQuery<{
    appointmentsToday: number;
    appointmentsChange: number;
    leadsInRange: number;
    leadsChange: number;
    conversionRate: number;
    conversionChange: number;
    chatbotConversations: number;
    chatbotChange: number;
    pendingCount: number;
    cancelledToday: number;
    completedToday: number;
    reviewsAvgRating: number;
    reviewsPending: number;
    revenue: number;
    revenueChange: number;
  }>(
    ['admin', 'dashboard', 'stats', range],
    '/admin/dashboard/stats/range',
    { range },
    { refetchInterval: 30_000 },
  );

  if (!data) return EMPTY_STATS;

  return {
    appointments_today: data.appointmentsToday ?? 0,
    appointments_change: data.appointmentsChange ?? 0,
    leads_in_range: data.leadsInRange ?? 0,
    leads_change: data.leadsChange ?? 0,
    conversion_rate: Number(data.conversionRate ?? 0),
    conversion_change: Number(data.conversionChange ?? 0),
    chatbot_conversations: data.chatbotConversations ?? 0,
    chatbot_change: data.chatbotChange ?? 0,
    pending_count: data.pendingCount ?? 0,
    cancelled_count: data.cancelledToday ?? 0,
    completed_today: data.completedToday ?? 0,
    reviews_avg_rating: Number(data.reviewsAvgRating ?? 0),
    reviews_pending: data.reviewsPending ?? 0,
    revenue: Number(data.revenue ?? 0),
    revenue_change: Number(data.revenueChange ?? 0),
    range,
  };
}

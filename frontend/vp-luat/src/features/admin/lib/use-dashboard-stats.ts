/**
 * Dashboard hooks — backed by the real BRS API.
 * All data flows through `/admin/dashboard/*` and the legacy
 * MockDB layer has been removed.
 */
'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/lib/api/hooks';
import {
  adminDashboardApi,
  backendDateToISO,
  type ActivityLog,
  type DashboardStats,
  type DistributionSlice,
  type LeadFunnel,
  type TimeSeriesPoint,
} from '@/lib/api/admin-dashboard';

// ─── Range / helpers ────────────────────────────────────────────────────────

export type DashboardRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - n);
  return x;
}

const RANGE_MS: Record<DashboardRange, number> = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  quarter: 90 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export const DASHBOARD_RANGES: ReadonlyArray<{ value: DashboardRange; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm nay' },
];

export function rangeStart(range: DashboardRange): Date {
  const now = new Date();
  switch (range) {
    case 'today':
      return startOfDay(now);
    case 'month':
      return daysAgo(now, 30);
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), q * 3, 1);
    }
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    case 'week':
    default:
      return daysAgo(now, 7);
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────

export interface BackendDashboardStats {
  appointments_today: number;
  appointments_change: number;
  leads_week: number;
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
  source: 'backend';
}

function toNumber(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

const EMPTY_STATS: BackendDashboardStats = {
  appointments_today: 0,
  appointments_change: 0,
  leads_week: 0,
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
  source: 'backend',
};

export function useDashboardStats(range: DashboardRange = 'week'): BackendDashboardStats {
  const api = useApiQuery<DashboardStats>(
    ['admin', 'dashboard', 'stats'],
    '/admin/dashboard/stats/range',
    { range },
    { staleTime: 60_000, retry: 1 },
  );

  return useMemo<BackendDashboardStats>(() => {
    const d = api.data;
    if (!d) return EMPTY_STATS;
    return {
      appointments_today: d.appointmentsToday ?? 0,
      appointments_change: d.appointmentsChange ?? 0,
      leads_week: d.leadsInRange ?? 0,
      leads_change: d.leadsChange ?? 0,
      conversion_rate: toNumber(d.conversionRate),
      conversion_change: toNumber(d.conversionChange),
      chatbot_conversations: d.chatbotConversations ?? 0,
      chatbot_change: d.chatbotChange ?? 0,
      pending_count: d.pendingCount ?? 0,
      cancelled_count: d.cancelledToday ?? 0,
      completed_today: d.completedToday ?? 0,
      reviews_avg_rating: toNumber(d.reviewsAvgRating),
      reviews_pending: d.reviewsPending ?? 0,
      revenue: toNumber(d.revenue),
      revenue_change: toNumber(d.revenueChange),
      source: 'backend',
    };
  }, [api.data]);
}

// ─── Visitor / Leads time-series ────────────────────────────────────────────

export interface VisitorPoint {
  date: string;
  value: number;
  label: string;
}

export function useVisitorSeries(range: DashboardRange = 'week'): {
  data: VisitorPoint[];
  isLoading: boolean;
} {
  const days = Math.round(RANGE_MS[range] / (24 * 60 * 60 * 1000));
  const api = useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'visitors', days],
    '/admin/dashboard/charts/visitors',
    { days },
    { staleTime: 60_000, retry: 1 },
  );

  return {
    data: (api.data ?? []).map((p) => ({
      date: backendDateToISO(p.date),
      value: p.value,
      label: p.label,
    })),
    isLoading: api.isLoading,
  };
}

// ─── Service distribution (donut) ───────────────────────────────────────────

export interface DonutSliceVM {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const DONUT_PALETTE = ['#1E3A5F', '#C9A84C', '#2563EB', '#059669', '#9CA3AF', '#7C3AED', '#EC4899'];

export function useServiceDistribution(range: DashboardRange = 'week'): {
  data: DonutSliceVM[];
  isLoading: boolean;
} {
  const api = useApiQuery<DistributionSlice[]>(
    ['admin', 'dashboard', 'service-dist', range],
    '/admin/dashboard/charts/service-distribution',
    { range },
    { staleTime: 60_000, retry: 1 },
  );

  return {
    data: (api.data ?? []).map((s, i) => ({
      label: s.label,
      value: s.count,
      percentage: s.percentage,
      color: DONUT_PALETTE[i % DONUT_PALETTE.length] ?? '#9CA3AF',
    })),
    isLoading: api.isLoading,
  };
}

// ─── Lead funnel ────────────────────────────────────────────────────────────

export function useLeadFunnel(range: DashboardRange = 'week'): {
  data: LeadFunnel;
  isLoading: boolean;
} {
  const api = useApiQuery<LeadFunnel>(
    ['admin', 'dashboard', 'lead-funnel', range],
    '/admin/dashboard/charts/lead-funnel',
    { range },
    { staleTime: 60_000, retry: 1 },
  );

  const empty: LeadFunnel = { total: 0, contacted: 0, qualified: 0, converted: 0, conversionRate: 0 };
  return { data: api.data ?? empty, isLoading: api.isLoading };
}

// ─── Revenue series ─────────────────────────────────────────────────────────

export function useRevenueSeries(range: DashboardRange = 'month'): {
  data: VisitorPoint[];
  isLoading: boolean;
} {
  const api = useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'revenue', range],
    '/admin/dashboard/charts/revenue',
    { range },
    { staleTime: 60_000, retry: 1 },
  );

  return {
    data: (api.data ?? []).map((p) => ({
      date: backendDateToISO(p.date),
      value: p.value,
      label: p.label,
    })),
    isLoading: api.isLoading,
  };
}

// ─── Recent activity ────────────────────────────────────────────────────────

export interface RecentActivity {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  entityLabel: string;
  createdAt: string;
}

function activityToRecent(a: ActivityLog): RecentActivity {
  return {
    id: a.id,
    actorName: a.actorName,
    action: a.action,
    entity: a.entityType ?? 'system',
    entityId: a.entityId ?? '',
    entityLabel: a.summary,
    createdAt: a.createdAt,
  };
}

export function useRecentActivity(
  _range: DashboardRange = 'week',
  limit = 8,
): { data: RecentActivity[]; isLoading: boolean } {
  const api = useApiQuery<ActivityLog[]>(
    ['admin', 'dashboard', 'activity', limit],
    '/admin/dashboard/activity',
    { limit },
    { staleTime: 30_000, retry: 1 },
  );
  return {
    data: (api.data ?? []).map(activityToRecent),
    isLoading: api.isLoading,
  };
}

// ─── Pricing table (kept for legacy components; values are static) ─────────

const SERVICE_PRICE: Record<string, number> = {
  'Tư vấn pháp lý': 1_500_000,
  'Tư vấn doanh nghiệp': 3_500_000,
  'Hợp đồng': 2_500_000,
  'Ly hôn': 4_000_000,
  'Đất đai': 5_000_000,
  'Sở hữu trí tuệ': 3_000_000,
  'Hình sự': 6_000_000,
  'Thừa kế': 2_000_000,
  'Lao động': 1_800_000,
  'Bảo hiểm xã hội': 1_500_000,
  'Nhập cư': 8_000_000,
  'Giấy phép': 2_200_000,
};
const DEFAULT_SERVICE_PRICE = 2_500_000;

export function servicePrice(service: string): number {
  return SERVICE_PRICE[service] ?? DEFAULT_SERVICE_PRICE;
}

// ─── Generic helpers used by other admin pages ─────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

/** Re-export so callers don't need a second import. */
export { adminDashboardApi, backendDateToISO };
export type { ActivityLog, DistributionSlice, LeadFunnel, TimeSeriesPoint, DashboardStats };

// ─── Legacy stubs (kept to satisfy remaining admin pages during migration) ─

/** Today's bookings from the backend — placeholder until the dashboard page
 *  is migrated to fetch the data directly from bookingApi. */
export function useTodayBookings() {
  return { data: [] as never[], isLoading: false };
}

/** Lead timeline chart data — placeholder. */
export function useLeadsTimelineChart(_range: DashboardRange = 'month') {
  return [] as Array<{ date: string; visits: number; leads: number }>;
}

/** Map a Booking status string → UI display key. Today the dashboard imports
 *  booking data straight from bookingApi so this is a noop pass-through. */
export function mapBookingStatus<T extends string>(s: T): T {
  return s;
}
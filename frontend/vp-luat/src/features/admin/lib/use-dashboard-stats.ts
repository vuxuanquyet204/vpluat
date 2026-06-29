/**
 * Dashboard hooks — call backend BRS endpoints via TanStack Query,
 * with graceful fallback to MockDB when backend is unavailable
 * (giai doan shadow mode, se xoa sau UAT).
 */
'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useApiQuery } from '@/lib/api/hooks';
import { adminDashboardApi, backendDateToISO, type ActivityLog, type DashboardStats, type DistributionSlice, type LeadFunnel, type TimeSeriesPoint } from '@/lib/api/admin-dashboard';
import { MockDB, type CollectionName } from '../mock/db';
import { useMockQuery } from './use-mock-query';
import type { AuditLog, Booking, ChatbotSession, Lead, Review } from '../types';

// ─── Range / helpers ────────────────────────────────────────────────────────

export type DashboardRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
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

// ─── Pricing table (mock fallback) ──────────────────────────────────────────

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

// ─── Source flag ────────────────────────────────────────────────────────────

function useShouldUseMock(): boolean {
  const { status } = useSession();
  // Neu chua hydrate session, dung mock de tranh race condition
  // (API goi se khong co token vi getSession() con dang pending).
  if (status === 'loading') return true;
  const flag = process.env.NEXT_PUBLIC_DASHBOARD_USE_MOCK;
  // Default = backend. Set "1"/"true" de fallback mock.
  return flag === '1' || flag === 'true';
}

// ─── Stats (backend primary, mock fallback) ─────────────────────────────────

export interface BackendDashboardStats extends DashboardStats {
  // Unified shape used by UI. Backend values win when available.
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
  source: 'backend' | 'mock';
}

function toNumber(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

export function useDashboardStats(range: DashboardRange = 'week'): BackendDashboardStats {
  const useMock = useShouldUseMock();
  const bookings = useMockQuery<Booking>('bookings');
  const leads = useMockQuery<Lead>('leads');
  const reviews = useMockQuery<Review>('reviews');
  const sessions = useMockQuery<ChatbotSession>('chatbot_sessions');

  const api = useApiQuery<DashboardStats>(
    ['admin', 'dashboard', 'stats'],
    '/admin/dashboard/stats/range',
    { range },
    { enabled: !useMock, staleTime: 60_000, retry: 1 },
  );

  const mockStats: BackendDashboardStats = useMemo(() => {
    const now = new Date();
    const todayStr = startOfDay(now).toISOString().slice(0, 10);
    const yesterdayStr = startOfDay(daysAgo(now, 1)).toISOString().slice(0, 10);
    const start = rangeStart(range);
    const prevStart = new Date(start.getTime() - (now.getTime() - start.getTime()));

    const allBookings = bookings.data ?? [];
    const allLeads = leads.data ?? [];
    const allReviews = reviews.data ?? [];
    const allSessions = sessions.data ?? [];

    const today = allBookings.filter(
      (b) => b.date === todayStr && b.status !== 'cancelled',
    );
    const yesterday = allBookings.filter(
      (b) => b.date === yesterdayStr && b.status !== 'cancelled',
    );

    const rangeLeads = allLeads.filter((l) => new Date(l.createdAt) >= start);
    const prevRangeLeads = allLeads.filter((l) => {
      const d = new Date(l.createdAt);
      return d >= prevStart && d < start;
    });

    const converted = rangeLeads.filter((l) => l.status === 'converted').length;
    const totalLeads = rangeLeads.length || 1;
    const prevConverted = prevRangeLeads.filter((l) => l.status === 'converted').length;
    const prevTotal = prevRangeLeads.length || 1;

    const todaySessions = allSessions.filter(
      (s) => s.startedAt && isSameDay(new Date(s.startedAt), now),
    );
    const yesterdaySessions = allSessions.filter(
      (s) => s.startedAt && isSameDay(new Date(s.startedAt), daysAgo(now, 1)),
    );

    const pending = allBookings.filter((b) => b.status === 'pending').length;
    const cancelled = allBookings.filter(
      (b) => b.status === 'cancelled' && b.date === todayStr,
    ).length;
    const completedToday = allBookings.filter(
      (b) => b.status === 'completed' && b.date === todayStr,
    ).length;

    const revenueBookings = allBookings.filter(
      (b) =>
        (b.status === 'completed' || b.status === 'confirmed') &&
        new Date(b.date) >= start,
    );
    const prevRevenueBookings = allBookings.filter((b) => {
      if (b.status !== 'completed' && b.status !== 'confirmed') return false;
      const d = new Date(b.date);
      return d >= prevStart && d < start;
    });
    const revenue = revenueBookings.reduce((sum, b) => sum + servicePrice(b.service), 0);
    const prevRevenue = prevRevenueBookings.reduce((sum, b) => sum + servicePrice(b.service), 0);

    const approvedReviews = allReviews.filter((r) => r.status === 'approved');
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
        : 0;
    const reviewsPending = allReviews.filter((r) => r.status === 'pending').length;

    return {
      appointments_today: today.length,
      appointments_change: today.length - yesterday.length,
      leads_week: rangeLeads.length,
      leads_change: rangeLeads.length - prevRangeLeads.length,
      conversion_rate: Math.round((converted / totalLeads) * 1000) / 10,
      conversion_change:
        Math.round((converted / totalLeads) * 1000) / 10 -
        Math.round((prevConverted / prevTotal) * 1000) / 10,
      chatbot_conversations: todaySessions.length,
      chatbot_change: todaySessions.length - yesterdaySessions.length,
      pending_count: pending,
      cancelled_count: cancelled,
      completed_today: completedToday,
      reviews_avg_rating: Math.round(avgRating * 10) / 10,
      reviews_pending: reviewsPending,
      revenue,
      revenue_change: revenue - prevRevenue,
      source: 'mock',
    };
  }, [bookings.data, leads.data, reviews.data, sessions.data, range]);

  const backendStats: BackendDashboardStats | null = useMemo(() => {
    const d = api.data;
    if (!d) return null;
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

  return backendStats ?? mockStats;
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
  source: 'backend' | 'mock';
} {
  const useMock = useShouldUseMock();
  const days = Math.round(RANGE_MS[range] / (24 * 60 * 60 * 1000));
  const api = useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'visitors', days],
    '/admin/dashboard/charts/visitors',
    { days },
    { enabled: !useMock, staleTime: 60_000, retry: 1 },
  );
  const mockLeads = useMockQuery<Lead>('leads');

  const mockData = useMemo<VisitorPoint[]>(() => {
    const buckets: VisitorPoint[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(now, i);
      const key = d.toISOString().slice(0, 10);
      const dayStart = startOfDay(d).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayLeads = (mockLeads.data ?? []).filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      buckets.push({
        date: key,
        value: dayLeads,
        label: key,
      });
    }
    return buckets;
  }, [mockLeads.data, days]);

  if (api.data) {
    return {
      data: api.data.map((p) => ({
        date: backendDateToISO(p.date),
        value: p.value,
        label: p.label,
      })),
      isLoading: api.isLoading,
      source: 'backend',
    };
  }

  return { data: mockData, isLoading: api.isLoading, source: 'mock' };
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
  source: 'backend' | 'mock';
} {
  const useMock = useShouldUseMock();
  const api = useApiQuery<DistributionSlice[]>(
    ['admin', 'dashboard', 'service-dist', range],
    '/admin/dashboard/charts/service-distribution',
    { range },
    { enabled: !useMock, staleTime: 60_000, retry: 1 },
  );
  const mockLeads = useMockQuery<Lead>('leads');

  const mockData = useMemo<DonutSliceVM[]>(() => {
    const start = rangeStart(range).getTime();
    const map = new Map<string, number>();
    (mockLeads.data ?? []).forEach((l) => {
      if (new Date(l.createdAt).getTime() < start) return;
      map.set(l.service, (map.get(l.service) ?? 0) + 1);
    });
    const total = Array.from(map.values()).reduce((s, n) => s + n, 0) || 1;
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100),
        color: DONUT_PALETTE[i % DONUT_PALETTE.length] ?? '#9CA3AF',
      }));
  }, [mockLeads.data, range]);

  if (api.data) {
    return {
      data: api.data.map((s, i) => ({
        label: s.label,
        value: s.count,
        percentage: s.percentage,
        color: DONUT_PALETTE[i % DONUT_PALETTE.length] ?? '#9CA3AF',
      })),
      isLoading: api.isLoading,
      source: 'backend',
    };
  }

  return { data: mockData, isLoading: api.isLoading, source: 'mock' };
}

// ─── Lead funnel ────────────────────────────────────────────────────────────

export function useLeadFunnel(range: DashboardRange = 'week'): {
  data: LeadFunnel;
  isLoading: boolean;
  source: 'backend' | 'mock';
} {
  const useMock = useShouldUseMock();
  const api = useApiQuery<LeadFunnel>(
    ['admin', 'dashboard', 'lead-funnel', range],
    '/admin/dashboard/charts/lead-funnel',
    { range },
    { enabled: !useMock, staleTime: 60_000, retry: 1 },
  );
  const mockLeads = useMockQuery<Lead>('leads');

  const mockFunnel = useMemo<LeadFunnel>(() => {
    const start = rangeStart(range).getTime();
    const list = (mockLeads.data ?? []).filter((l) => new Date(l.createdAt).getTime() >= start);
    const total = list.length;
    const contacted = list.filter((l) => ['contacted', 'progress', 'converted'].includes(l.status)).length;
    const qualified = list.filter((l) => ['progress', 'converted'].includes(l.status)).length;
    const converted = list.filter((l) => l.status === 'converted').length;
    return {
      total,
      contacted,
      qualified,
      converted,
      conversionRate: total === 0 ? 0 : Math.round((converted * 100 / total) * 100) / 100,
    };
  }, [mockLeads.data, range]);

  if (api.data) {
    return { data: api.data, isLoading: api.isLoading, source: 'backend' };
  }
  return { data: mockFunnel, isLoading: api.isLoading, source: 'mock' };
}

// ─── Revenue series ─────────────────────────────────────────────────────────

export function useRevenueSeries(range: DashboardRange = 'month'): {
  data: VisitorPoint[];
  isLoading: boolean;
  source: 'backend' | 'mock';
} {
  const useMock = useShouldUseMock();
  const api = useApiQuery<TimeSeriesPoint[]>(
    ['admin', 'dashboard', 'revenue', range],
    '/admin/dashboard/charts/revenue',
    { range },
    { enabled: !useMock, staleTime: 60_000, retry: 1 },
  );
  const mockBookings = useMockQuery<Booking>('bookings');

  const mockData = useMemo<VisitorPoint[]>(() => {
    const start = rangeStart(range).getTime();
    const days = Math.round(RANGE_MS[range] / (24 * 60 * 60 * 1000));
    const buckets: VisitorPoint[] = [];
    const now = new Date();
    const map = new Map<string, number>();
    (mockBookings.data ?? []).forEach((b) => {
      if (b.status !== 'completed' && b.status !== 'confirmed') return;
      const t = new Date(b.date).getTime();
      if (t < start) return;
      map.set(b.date, (map.get(b.date) ?? 0) + servicePrice(b.service));
    });
    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(now, i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ date: key, value: map.get(key) ?? 0, label: key });
    }
    return buckets;
  }, [mockBookings.data, range]);

  if (api.data) {
    return {
      data: api.data.map((p) => ({
        date: backendDateToISO(p.date),
        value: p.value,
        label: p.label,
      })),
      isLoading: api.isLoading,
      source: 'backend',
    };
  }
  return { data: mockData, isLoading: api.isLoading, source: 'mock' };
}

// ─── Recent activity ────────────────────────────────────────────────────────

function activityToAudit(a: ActivityLog): AuditLog {
  const map: Record<string, AuditLog['action']> = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    STATUS_CHANGE: 'status_change',
    ASSIGN: 'assign',
    PUBLISH: 'publish',
    UNPUBLISH: 'unpublish',
    LOGIN: 'login',
    LOGOUT: 'logout',
    IMPERSONATE: 'impersonate',
  };
  return {
    id: a.id,
    actorId: '',
    actorName: a.actorName,
    action: map[a.action.toUpperCase()] ?? 'update',
    entity: a.entityType ?? 'system',
    entityId: a.entityId ?? '',
    entityLabel: a.summary,
    createdAt: a.createdAt,
  };
}

export function useRecentActivity(
  range: DashboardRange = 'week',
  limit = 8,
): { data: AuditLog[]; isLoading: boolean; source: 'backend' | 'mock' } {
  const useMock = useShouldUseMock();
  const api = useApiQuery<ActivityLog[]>(
    ['admin', 'dashboard', 'activity', limit],
    '/admin/dashboard/activity',
    { limit },
    { enabled: !useMock, staleTime: 30_000, retry: 1 },
  );
  const mockAudit = useMockQuery<AuditLog>('audit_logs', undefined, {
    by: 'createdAt',
    dir: 'desc',
  });

  const mockData = useMemo(() => {
    const start = rangeStart(range).getTime();
    return (mockAudit.data ?? [])
      .filter((a) => new Date(a.createdAt).getTime() >= start)
      .slice(0, limit);
  }, [mockAudit.data, range, limit]);

  if (api.data) {
    return {
      data: api.data.map(activityToAudit),
      isLoading: api.isLoading,
      source: 'backend',
    };
  }
  return { data: mockData, isLoading: api.isLoading, source: 'mock' };
}

// ─── Existing mock-only helpers (kept for legacy components) ────────────────

export function useTodayBookings() {
  const { data, isLoading } = useMockQuery<Booking>('bookings');
  return useMemo(() => {
    const today = startOfDay(new Date()).toISOString().slice(0, 10);
    const list = (data ?? [])
      .filter((b) => b.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
    return { data: list, isLoading };
  }, [data, isLoading]);
}

export function useLeadsTimelineChart(range: DashboardRange = 'month') {
  const days = Math.min(365, Math.max(1, Math.round(RANGE_MS[range] / (24 * 60 * 60 * 1000))));
  const { data } = useMockQuery<Lead>('leads');
  return useMemo(() => {
    const now = new Date();
    const buckets: Array<{ date: string; visits: number; leads: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = daysAgo(now, i);
      const key = d.toISOString().slice(0, 10);
      const dayStart = startOfDay(d).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayLeads = (data ?? []).filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      buckets.push({
        date: key,
        visits: Math.max(20, dayLeads * 6 + Math.round(Math.random() * 50)),
        leads: dayLeads,
      });
    }
    return buckets;
  }, [data, days]);
}

export function mapBookingStatus(s: Booking['status']): 'confirmed' | 'pending' | 'cancelled' | 'in_progress' {
  switch (s) {
    case 'completed':
      return 'confirmed';
    case 'pending':
    case 'confirmed':
    case 'cancelled':
      return s;
    default:
      return 'pending';
  }
}

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

export type { CollectionName };

// Re-export MockDB de compat
export { MockDB };

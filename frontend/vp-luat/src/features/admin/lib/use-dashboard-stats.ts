/**
 * Hooks chuyên biệt cho dashboard — tính toán stats real-time từ MockDB.
 * Auto-refresh khi bất kỳ collection nào thay đổi.
 */
'use client';

import { useMemo } from 'react';
import { MockDB, type CollectionName } from '../mock/db';
import { useMockQuery } from './use-mock-query';
import type { AuditLog, Booking, BookingStatus, Lead, Review, ChatbotSession } from '../types';

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

export type DashboardRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

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

// Bảng giá dịch vụ mock (VNĐ / buổi tư vấn). Service name phải khớp Lead.service
// và Booking.service. Tên fallback thành "Tư vấn pháp lý" nếu không match.
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

export interface DashboardStats {
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
}

export function useDashboardStats(range: DashboardRange = 'week'): DashboardStats {
  const bookings = useMockQuery<Booking>('bookings');
  const leads = useMockQuery<Lead>('leads');
  const reviews = useMockQuery<Review>('reviews');
  const sessions = useMockQuery<ChatbotSession>('chatbot_sessions');

  return useMemo(() => {
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
    const revenue = revenueBookings.reduce(
      (sum, b) => sum + servicePrice(b.service),
      0,
    );
    const prevRevenue = prevRevenueBookings.reduce(
      (sum, b) => sum + servicePrice(b.service),
      0,
    );
    const revenue_change = revenue - prevRevenue;

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
      revenue,
      revenue_change,
      reviews_avg_rating: Math.round(avgRating * 10) / 10,
      reviews_pending: reviewsPending,
    };
  }, [bookings.data, leads.data, reviews.data, sessions.data, range]);
}

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

export function useRecentAuditLogs(
  rangeOrLimit: DashboardRange | number = 'week',
  maybeLimit?: number,
) {
  const range: DashboardRange = typeof rangeOrLimit === 'number' ? 'week' : rangeOrLimit;
  const limit = typeof rangeOrLimit === 'number' ? rangeOrLimit : maybeLimit ?? 8;
  const { data, isLoading } = useMockQuery<AuditLog>('audit_logs', undefined, {
    by: 'createdAt',
    dir: 'desc',
  });
  return useMemo(() => {
    const start = rangeStart(range).getTime();
    const filtered = (data ?? []).filter((a) => new Date(a.createdAt).getTime() >= start);
    return { data: filtered.slice(0, limit), isLoading };
  }, [data, limit, isLoading, range]);
}

export function useServiceDistribution(range: DashboardRange = 'week') {
  const { data } = useMockQuery<Lead>('leads');
  return useMemo(() => {
    const start = rangeStart(range).getTime();
    const map = new Map<string, number>();
    (data ?? []).forEach((l) => {
      if (new Date(l.createdAt).getTime() < start) return;
      map.set(l.service, (map.get(l.service) ?? 0) + 1);
    });
    const total = Array.from(map.values()).reduce((s, n) => s + n, 0) || 1;
    const palette = ['#1E3A5F', '#C9A84C', '#2563EB', '#059669', '#9CA3AF', '#7C3AED', '#EC4899'];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        percentage: Math.round((value / total) * 100),
        color: palette[i % palette.length] ?? '#9CA3AF',
      }));
  }, [data, range]);
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

// Map booking status cũ → biến thể (compat với BookingTable hiện tại)
export function mapBookingStatus(s: BookingStatus): 'confirmed' | 'pending' | 'cancelled' | 'in_progress' {
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
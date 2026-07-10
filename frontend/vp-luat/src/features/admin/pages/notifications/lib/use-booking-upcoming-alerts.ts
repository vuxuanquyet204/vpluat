/**
 * Hook kiểm tra booking sắp diễn ra trong 24h, đẩy notification (chạy 1 lần/session).
 * Sử dụng backend API thay vì MockDB.
 * Dùng localStorage flag để tránh spam.
 */
'use client';

import { useEffect } from 'react';
import { bookingApi } from '@/lib/api/admin-booking';
import { useAdminUIStore } from '@/features/admin/store';
import { notifyBookingUpcoming } from './notification-bridge';

const ALERT_FLAG = 'vp-luat-booking-upcoming-alert';
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

export function useBookingUpcomingAlerts(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const today = new Date().toISOString().split('T')[0];

    bookingApi.getStats(today).then((statsData) => {
      const appointments = statsData?.todayAppointments ?? [];
      const now = Date.now();

      const upcoming = appointments
        .map((b: { scheduledAt?: string; status?: string; clientName?: string; id?: string }) => {
          const dateStr = b.scheduledAt ? b.scheduledAt.split('T')[0] : '';
          const timeStr = b.scheduledAt
            ? (b.scheduledAt.split('T')[1]?.slice(0, 5) ?? '00:00')
            : '00:00';
          const ts = new Date(`${dateStr}T${timeStr}:00`).getTime();
          return { b, ts };
        })
        .filter(({ b, ts }: { b: { status?: string }; ts: number }) => {
          if (b.status === 'CANCELLED' || b.status === 'COMPLETED') return false;
          if (Number.isNaN(ts)) return false;
          const diff = ts - now;
          return diff > 0 && diff < WINDOW_MS;
        });

      if (upcoming.length === 0) return;

      const stored = window.localStorage.getItem(ALERT_FLAG);
      const lastTs = stored ? parseInt(stored, 10) : 0;
      if (Math.abs(now - lastTs) < 5 * 60 * 1000) return;

      const existing = useAdminUIStore.getState().notifications;
      const hasRecent = existing.some(
        (n: { type?: string; createdAt?: string }) =>
          n.type === 'booking_upcoming' &&
          n.createdAt &&
          Math.abs(now - new Date(n.createdAt).getTime()) < 5 * 60 * 1000,
      );
      if (hasRecent) return;

      const top = upcoming.sort((a: { ts: number }, c: { ts: number }) => a.ts - c.ts)[0];
      const dateStr = top.b.scheduledAt ? top.b.scheduledAt.split('T')[0] ?? '' : '';
      const timeStr = top.b.scheduledAt
        ? (top.b.scheduledAt.split('T')[1]?.slice(0, 5) ?? '')
        : '';
      notifyBookingUpcoming(
        top.b.clientName ?? 'Khách hàng',
        dateStr,
        timeStr,
        top.b.id ?? '',
      );
      window.localStorage.setItem(ALERT_FLAG, String(now));
    }).catch(() => {
      // silently fail — alerts are non-critical
    });
  }, []);
}

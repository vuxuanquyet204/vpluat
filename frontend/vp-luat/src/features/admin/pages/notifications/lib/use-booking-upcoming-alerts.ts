/**
 * Hook kiểm tra booking sắp diễn ra trong 24h, đẩy notification (chạy 1 lần/session).
 * Mock-only: dùng localStorage flag để tránh spam.
 */
'use client';

import { useEffect } from 'react';
import { MockDB } from '@/features/admin/mock/db';
import { useAdminUIStore } from '@/features/admin/store';
import { notifyBookingUpcoming } from './notification-bridge';

const ALERT_FLAG = 'vp-luat-booking-upcoming-alert';
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

export function useBookingUpcomingAlerts(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const all = MockDB.getAll<Record<string, unknown>>('bookings');
    const now = Date.now();
    const upcoming = all
      .map((b) => {
        const date = String(b.date ?? '');
        const time = String(b.time ?? '00:00');
        const ts = new Date(`${date}T${time}:00`).getTime();
        return { b, ts };
      })
      .filter(({ b, ts }) => {
        if (b.status === 'cancelled' || b.status === 'completed') return false;
        if (Number.isNaN(ts)) return false;
        const diff = ts - now;
        return diff > 0 && diff < WINDOW_MS;
      });

    if (upcoming.length === 0) return;

    // Đánh dấu đã alert
    const stored = window.localStorage.getItem(ALERT_FLAG);
    const lastTs = stored ? parseInt(stored, 10) : 0;
    if (Math.abs(now - lastTs) < 5 * 60 * 1000) return; // throttle 5 phút

    // Đã có notification booking_upcoming trong 5 phút gần nhất thì skip
    const existing = useAdminUIStore.getState().notifications;
    const hasRecent = existing.some(
      (n) =>
        n.type === 'booking_upcoming' &&
        n.createdAt &&
        Math.abs(now - new Date(n.createdAt).getTime()) < 5 * 60 * 1000,
    );
    if (hasRecent) return;

    // Chỉ thông báo booking sắp tới nhất
    const top = upcoming.sort((a, c) => a.ts - c.ts)[0];
    notifyBookingUpcoming(
      String(top.b.customerName ?? 'Khách hàng'),
      String(top.b.date ?? ''),
      String(top.b.time ?? ''),
      String(top.b.id ?? ''),
    );
    window.localStorage.setItem(ALERT_FLAG, String(now));
  }, []);
}
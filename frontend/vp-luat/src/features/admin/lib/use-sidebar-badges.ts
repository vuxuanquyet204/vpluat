/**
 * useSidebarBadges — đếm số thông báo thật cho sidebar.
 * Auto-invalidate khi bất kỳ collection nào thay đổi.
 */
'use client';

import { useMemo } from 'react';
import { useMockQuery } from './use-mock-query';
import type { Booking, Lead, Review } from '../types';
import type { SidebarBadgeSource } from '../constants/sidebar-nav';

export function useSidebarBadges(): Record<SidebarBadgeSource, number> {
  const { data: leads } = useMockQuery<Lead>('leads');
  const { data: bookings } = useMockQuery<Booking>('bookings');
  const { data: reviews } = useMockQuery<Review>('reviews');

  return useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newLeads = (leads ?? []).filter(
      (l) => l.status === 'new' && new Date(l.createdAt).getTime() >= weekAgo,
    ).length;
    const pendingBookings = (bookings ?? []).filter((b) => b.status === 'pending').length;
    const pendingReviews = (reviews ?? []).filter((r) => r.status === 'pending').length;
    return {
      'new-leads': newLeads,
      'pending-bookings': pendingBookings,
      'pending-reviews': pendingReviews,
      'unread-notifications': 0,
    };
  }, [leads, bookings, reviews]);
}
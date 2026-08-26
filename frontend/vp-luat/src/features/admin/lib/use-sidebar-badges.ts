/**
 * useSidebarBadges — đếm số thông báo thật cho sidebar.
 * Auto-invalidate khi bất kỳ collection nào thay đổi.
 */
'use client';

import { useApiQuery } from '@/lib/api/hooks';
import type { PageResponse } from '@/lib/api/hooks';
import type { Lead, Review } from '@/lib/api/admin-crm';
import type { Appointment } from '@/lib/api/admin-booking';
import type { SidebarBadgeSource } from '../constants/sidebar-nav';

export function useSidebarBadges(): Record<SidebarBadgeSource, number> {
  const { data: leads } = useApiQuery<PageResponse<Lead>>(
    ['admin', 'sidebar-badges', 'leads'],
    '/crm/leads',
    { page: 0, size: 200, status: 'NEW' },
  );
  const { data: bookings } = useApiQuery<PageResponse<Appointment>>(
    ['admin', 'sidebar-badges', 'bookings'],
    '/bookings',
    { page: 0, size: 200, status: 'PENDING' },
  );
  const { data: reviews } = useApiQuery<PageResponse<Review>>(
    ['admin', 'sidebar-badges', 'reviews'],
    '/crm/reviews',
    { page: 0, size: 200, status: 'PENDING' },
  );

  return {
    'new-leads': leads?.totalElements ?? leads?.content.length ?? 0,
    'pending-bookings': bookings?.totalElements ?? bookings?.content.length ?? 0,
    'pending-reviews': reviews?.totalElements ?? reviews?.content.length ?? 0,
    'unread-notifications': 0,
  };
}
'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadApi, reviewApi } from '@/lib/api/admin-crm';
import { bookingApi } from '@/lib/api/admin-booking';
import type { Lead, Review } from '@/lib/api/admin-crm';
import type { Appointment } from '@/lib/api/admin-booking';
import type {
  Lead as LeadUI,
  Booking as BookingUI,
  Review as ReviewUI,
  LeadStatus,
  BookingStatus,
  ReviewStatus,
} from '@/features/admin/types';

// ─── Adapters (backend → UI types) ──────────────────────────────────────

function beLeadToUI(l: Lead): LeadUI {
  return {
    id: l.id,
    name: l.name ?? '',
    phone: l.phone ?? '',
    email: l.email ?? '',
    service: l.serviceName ?? '',
    source: (l.source as LeadUI['source']) ?? 'other',
    status: (l.status.toLowerCase() ?? 'new') as LeadStatus,
    assignedTo: l.assignedTo?.id ?? l.assignedToName ?? '',
    notes: l.notes,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

function beApptToBooking(a: Appointment): BookingUI {
  const methodMap: Record<string, BookingUI['method']> = {
    ONLINE: 'online',
    PHONE: 'phone',
    OFFLINE: 'office',
  };
  return {
    id: a.id,
    customerName: a.clientName,
    customerEmail: a.clientEmail,
    customerPhone: a.clientPhone,
    service: a.serviceName ?? '',
    lawyer: a.lawyerName ?? '',
    date: a.scheduledAt ? a.scheduledAt.split('T')[0] : '',
    time: a.scheduledAt ? a.scheduledAt.split('T')[1]?.slice(0, 5) ?? '' : '',
    method: methodMap[a.meetingType?.toUpperCase()] ?? 'office',
    status: (a.status.toLowerCase() ?? 'pending') as BookingStatus,
    notes: a.internalNotes,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt ?? a.createdAt,
  };
}

function beReviewToUI(r: Review): ReviewUI {
  const statusMap: Record<string, ReviewStatus> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SPAM: 'rejected',
  };
  const extra = r as unknown as Record<string, unknown>;
  return {
    id: r.id,
    authorName: r.clientName,
    authorEmail: r.clientEmail ?? '',
    rating: r.rating,
    content: r.contentVi,
    service: r.serviceName ?? '',
    lawyer: r.lawyerName ?? '',
    status: statusMap[r.status] ?? 'pending',
    reply: extra.reply as string | undefined,
    repliedByName: extra.repliedByName as string | undefined,
    repliedAt: extra.repliedAt as string | undefined,
    createdAt: r.createdAt,
    updatedAt: extra.updatedAt as string | undefined,
  };
}

// ─── Hooks ───────────────────────────────────────────────────────────────

export function useLeadKanban() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'kanban', 'leads'],
    queryFn: async () => {
      const res = await leadApi.list({ size: 200 });
      return (res.content ?? []).map(beLeadToUI);
    },
  });

  return { data: data as LeadUI[], isLoading, error };
}

export function useBookingKanban() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'kanban', 'bookings'],
    queryFn: async () => {
      const res = await bookingApi.list({ size: 200 });
      return (res.content ?? []).map(beApptToBooking);
    },
  });

  return { data: data as BookingUI[], isLoading, error };
}

export function useReviewKanban() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'kanban', 'reviews'],
    queryFn: async () => {
      const res = await reviewApi.list({ size: 50 });
      return (res.content ?? []).map(beReviewToUI);
    },
  });

  return { data: data as ReviewUI[], isLoading, error };
}

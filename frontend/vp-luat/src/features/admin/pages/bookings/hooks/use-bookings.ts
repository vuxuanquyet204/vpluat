'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { bookingApi } from '@/lib/api/admin-booking';
import type { Booking, BookingStatus } from '../../../types';

export interface UseBookingsOptions {
  status?: BookingStatus | 'all';
  lawyer?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  size?: number;
}

function instantToLocalDate(isoString: string): Date {
  return new Date(isoString);
}

function formatToDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function formatToTimeString(date: Date): string {
  return format(date, 'HH:mm');
}

export function useBookings(options: UseBookingsOptions = {}): Booking[] {
  const { status, lawyer, dateFrom, dateTo, search, page = 0, size = 100 } = options;

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, size };
    if (status && status !== 'all') params.status = status.toUpperCase();
    return params;
  }, [status, page, size]);

  const { data } = useQuery({
    queryKey: ['bookings', queryParams],
    queryFn: () => bookingApi.list(queryParams),
    staleTime: 30 * 1000,
  });

  return useMemo(() => {
    let result: Booking[] = (data?.content ?? []).map((appt) => {
      const scheduledDate = appt.scheduledAt ? instantToLocalDate(appt.scheduledAt) : new Date();
      return {
        id: appt.id,
        customerName: appt.clientName,
        customerEmail: appt.clientEmail,
        customerPhone: appt.clientPhone,
        lawyer: appt.lawyerName ?? '',
        service: appt.serviceName ?? '',
        method: (appt.meetingType ?? 'OFFICE').toLowerCase() as Booking['method'],
        date: formatToDateString(scheduledDate),
        time: formatToTimeString(scheduledDate),
        status: appt.status?.toLowerCase() as BookingStatus,
        notes: appt.internalNotes,
        cancelledReason: appt.cancelReason,
        createdAt: appt.createdAt ?? '',
        updatedAt: appt.updatedAt ?? '',
      };
    });

    // Client-side filtering for fields not in API params
    if (lawyer && lawyer !== 'all') {
      result = result.filter((b) => b.lawyer === lawyer);
    }
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((b) => new Date(b.date).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000;
      result = result.filter((b) => new Date(b.date).getTime() <= to);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.lawyer.toLowerCase().includes(q),
      );
    }

    return result;
  }, [data, lawyer, dateFrom, dateTo, search]);
}

export function useBooking(id: string | null | undefined) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => (id ? bookingApi.get(id) : null),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

export function useBookingStats(date?: string) {
  return useQuery({
    queryKey: ['booking-stats', date],
    queryFn: () => bookingApi.getStats(date),
    staleTime: 60 * 1000,
  });
}

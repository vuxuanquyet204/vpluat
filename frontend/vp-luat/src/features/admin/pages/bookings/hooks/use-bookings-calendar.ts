'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api/admin-booking';
import type { Booking, BookingStatus } from '../../../types';

export interface UseBookingsCalendarOptions {
  date: Date;
  view?: 'week' | 'day';
  lawyerFilter?: string;
}

const VIETNAM_TIMEZONE_OFFSET = 7 * 60; // minutes ahead of UTC

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function instantToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  // Apply Vietnam timezone offset (UTC+7) for date display
  const vietDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET * 60 * 1000);
  return format(vietDate, 'yyyy-MM-dd');
}

function instantToLocalTime(isoString: string): string {
  const date = new Date(isoString);
  // Apply Vietnam timezone offset (UTC+7) for time display
  const vietDate = new Date(date.getTime() + VIETNAM_TIMEZONE_OFFSET * 60 * 1000);
  return format(vietDate, 'HH:mm');
}

export function useBookingsCalendar({
  date,
  view = 'week',
  lawyerFilter = 'all',
}: UseBookingsCalendarOptions): { bookings: Booking[]; isLoading: boolean } {
  const weekStart = date;

  const weekStartStr = fmtDate(weekStart);
  const weekEndStr = fmtDate(
    new Date(weekStart.getTime() + (view === 'day' ? 0 : 6) * 24 * 60 * 60 * 1000),
  );

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['bookings-calendar', weekStartStr, weekEndStr, lawyerFilter],
    queryFn: () =>
      bookingApi.calendar({
        from: weekStartStr,
        to: weekEndStr,
        ...(lawyerFilter !== 'all' ? { lawyerId: lawyerFilter } : {}),
      }),
    staleTime: 30 * 1000,
  });

  const bookings: Booking[] = useMemo(
    () =>
      appointments.map((appt) => ({
        id: appt.id,
        customerName: appt.clientName,
        customerEmail: appt.clientEmail,
        customerPhone: appt.clientPhone,
        lawyer: appt.lawyerName ?? '',
        service: appt.serviceName ?? '',
        method: (appt.meetingType ?? 'OFFICE').toLowerCase() as Booking['method'],
        date: appt.scheduledAt ? instantToLocalDate(appt.scheduledAt) : '',
        time: appt.scheduledAt ? instantToLocalTime(appt.scheduledAt) : '',
        status: (appt.status ?? 'pending').toLowerCase() as BookingStatus,
        notes: appt.issueSummary ?? '',
        cancelledReason: appt.cancelReason,
        createdAt: appt.createdAt ?? '',
        updatedAt: appt.updatedAt ?? '',
      })),
    [appointments],
  );

  return { bookings, isLoading };
}

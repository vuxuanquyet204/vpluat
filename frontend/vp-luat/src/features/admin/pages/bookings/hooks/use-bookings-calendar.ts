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

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function instantToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  return format(date, 'yyyy-MM-dd');
}

function instantToLocalTime(isoString: string): string {
  const date = new Date(isoString);
  return format(date, 'HH:mm');
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
        status: appt.status?.toLowerCase() as BookingStatus,
        notes: appt.internalNotes,
        cancelledReason: appt.cancelReason,
        createdAt: appt.createdAt ?? '',
        updatedAt: appt.updatedAt ?? '',
      })),
    [appointments],
  );

  return { bookings, isLoading };
}

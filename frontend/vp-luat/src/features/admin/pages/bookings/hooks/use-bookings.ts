'use client';

import { useMemo } from 'react';
import { useMockQuery } from '../../../lib/use-mock-query';
import { MockDB } from '../../../mock/db';
import type { Booking, BookingStatus } from '../../../types';

export interface UseBookingsOptions {
  status?: BookingStatus | 'all';
  lawyer?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function useBookings(options: UseBookingsOptions = {}): Booking[] {
  const { data = [] } = useMockQuery<Booking>('bookings');
  return useMemo(() => {
    let result = data;
    if (options.status && options.status !== 'all') {
      result = result.filter((b: Booking) => b.status === options.status);
    }
    if (options.lawyer && options.lawyer !== 'all') {
      result = result.filter((b: Booking) => b.lawyer === options.lawyer);
    }
    if (options.dateFrom) {
      const from = new Date(options.dateFrom).getTime();
      result = result.filter((b: Booking) => new Date(b.date).getTime() >= from);
    }
    if (options.dateTo) {
      const to = new Date(options.dateTo).getTime() + 24 * 60 * 60 * 1000;
      result = result.filter((b: Booking) => new Date(b.date).getTime() <= to);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (b: Booking) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.service.toLowerCase().includes(q) ||
          b.lawyer.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, options.status, options.lawyer, options.dateFrom, options.dateTo, options.search]);
}

export function useBooking(id: string | null | undefined): Booking | null {
  if (!id) return null;
  return MockDB.getById<Booking>('bookings', id);
}

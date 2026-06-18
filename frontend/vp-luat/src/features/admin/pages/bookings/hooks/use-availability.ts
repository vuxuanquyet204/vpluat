'use client';

import { useMemo } from 'react';
import { useMockQuery } from '../../../lib/use-mock-query';
import type { Lawyer, Booking, LawyerSchedule } from '../../../types';

export interface AvailabilitySlot {
  start: string; // HH:mm
  end: string; // HH:mm
  isAvailable: boolean;
  bookingId?: string;
  customerName?: string;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number; // 0-6, 0=Sunday
  slots: AvailabilitySlot[];
}

const DEFAULT_SLOTS = [
  { start: '08:00', end: '08:30' },
  { start: '08:30', end: '09:00' },
  { start: '09:00', end: '09:30' },
  { start: '09:30', end: '10:00' },
  { start: '10:00', end: '10:30' },
  { start: '10:30', end: '11:00' },
  { start: '11:00', end: '11:30' },
  { start: '11:30', end: '12:00' },
  { start: '13:30', end: '14:00' },
  { start: '14:00', end: '14:30' },
  { start: '14:30', end: '15:00' },
  { start: '15:00', end: '15:30' },
  { start: '15:30', end: '16:00' },
  { start: '16:00', end: '16:30' },
  { start: '16:30', end: '17:00' },
  { start: '17:00', end: '17:30' },
];

function getDayOfWeek(date: string): number {
  return new Date(date + 'T00:00:00').getDay();
}

function getWeekDates(start: Date): string[] {
  const dates: string[] = [];
  const base = new Date(start);
  base.setHours(0, 0, 0, 0);
  const dow = base.getDay();
  // Tuần bắt đầu từ T2
  const diff = dow === 0 ? -6 : 1 - dow;
  base.setDate(base.getDate() + diff);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function useAvailability(
  lawyerId: string | 'all',
  startDate: string,
): { days: DayAvailability[]; lawyers: Lawyer[] } {
  const { data: lawyers = [] } = useMockQuery<Lawyer>('lawyers');
  const { data: schedules = [] } = useMockQuery<LawyerSchedule>('lawyer_schedules');
  const { data: bookings = [] } = useMockQuery<Booking>('bookings');

  return useMemo(() => {
    const targetLawyers = lawyerId === 'all' ? lawyers : lawyers.filter((l) => l.id === lawyerId);
    const dates = getWeekDates(new Date(startDate));

    const days: DayAvailability[] = dates.map((date) => {
      const dow = getDayOfWeek(date);
      // Build slots for the first lawyer (simplified) — show per-day only
      const targetLawyer = targetLawyers[0];
      const schedule = schedules.find((s) => s.lawyerId === targetLawyer?.id && s.dayOfWeek === dow);
      const isOff = schedule?.isOff ?? dow === 0;

      const slots: AvailabilitySlot[] = DEFAULT_SLOTS.map((slot) => {
        const conflict = bookings.find(
          (b) =>
            b.lawyer === targetLawyer?.name &&
            b.date === date &&
            b.time === slot.start &&
            b.status !== 'cancelled',
        );
        return {
          start: slot.start,
          end: slot.end,
          isAvailable: !isOff && !conflict,
          bookingId: conflict?.id,
          customerName: conflict?.customerName,
        };
      });

      return { date, dayOfWeek: dow, slots };
    });

    return { days, lawyers: targetLawyers };
  }, [lawyers, schedules, bookings, lawyerId, startDate]);
}

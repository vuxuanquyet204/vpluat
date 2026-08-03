'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, startOfWeek } from 'date-fns';
import { lawyerScheduleApi, bookingApi } from '@/lib/api/admin-booking';
import type { Lawyer } from '../../../types';

export interface AvailabilitySlot {
  start: string; // HH:mm
  end: string;
  isAvailable: boolean;
  /** When `lawyerId === 'all'`, one cell can hold multiple conflicts. */
  bookings: Array<{
    bookingId: string;
    customerName: string;
    lawyerId: string | null;
    lawyerName: string | null;
    /** The booking's slot start (HH:mm) — used to label the cell. */
    bookingTime: string;
  }>;
  /** How many lawyers are still bookable in this slot (0 means "all taken / off"). */
  availableCount: number;
  /** Lawyer IDs that are marked off for this date. */
  offLawyerIds: string[];
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number; // 0-6, 0=Sunday
  slots: AvailabilitySlot[];
}

const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 17;
const SLOT_INTERVAL_MINUTES = 30;

function generateTimeSlots(): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  for (let hour = SLOT_START_HOUR; hour < SLOT_END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL_MINUTES) {
      const start = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const endMin = min + SLOT_INTERVAL_MINUTES;
      const endHour = endMin >= 60 ? hour + 1 : hour;
      const endMinRem = endMin % 60;
      const end = `${String(endHour).padStart(2, '0')}:${String(endMinRem).padStart(2, '0')}`;
      if (endHour > SLOT_END_HOUR || (endHour === SLOT_END_HOUR && endMinRem > 0)) continue;
      slots.push({ start, end });
    }
  }
  return slots;
}

const DEFAULT_SLOTS = generateTimeSlots();

function getWeekDates(startDate: Date): string[] {
  const dates: string[] = [];
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(weekStart, i), 'yyyy-MM-dd'));
  }
  return dates;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Returns true iff [bookingStart, bookingStart + durationMinutes) intersects [slotStart, slotEnd).
 * `durationMinutes` defaults to 60 when unknown.
 */
function isBookingInSlot(
  bookingStart: number,
  durationMinutes: number,
  slotStart: number,
  slotEnd: number,
): boolean {
  const bookingEnd = bookingStart + Math.max(durationMinutes, SLOT_INTERVAL_MINUTES);
  return bookingStart < slotEnd && bookingEnd > slotStart;
}

/**
 * Split a Date into local Y-M-D and H:M parts. Always uses the user's
 * local timezone — booking dates are stored as UTC instants but the calendar
 * grid should reflect local working hours.
 */
function splitLocal(date: Date): { ymd: string; hm: string } {
  const ymd = format(date, 'yyyy-MM-dd');
  const hm = format(date, 'HH:mm');
  return { ymd, hm };
}

export function useAvailability(
  lawyerId: string | 'all',
  startDate: string,
): {
  days: DayAvailability[];
  lawyers: Lawyer[];
  isLoading: boolean;
} {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = format(addDays(weekStart, 6), 'yyyy-MM-dd');
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');

  // Fetch all lawyers' schedules for the week
  const { data: schedulesMap = {}, isLoading: schedLoading } = useQuery({
    queryKey: ['lawyer-schedules', weekStartStr, weekEnd],
    queryFn: () => lawyerScheduleApi.getAllSchedules(weekStartStr, weekEnd),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch bookings in the date range for conflict detection
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-calendar', weekStartStr, weekEnd],
    queryFn: () => bookingApi.calendar({ from: weekStartStr, to: weekEnd }),
    staleTime: 30 * 1000,
  });

  // Build lawyers list from schedules map (always has all lawyers with schedules).
  const lawyers = useMemo((): Lawyer[] => {
    return Object.entries(schedulesMap).map(([id, sched]) => ({
      id,
      name: sched.regular?.[0]?.lawyerName ?? id,
      title: '',
      bio: '',
      specialties: [],
      email: '',
      phone: '',
      experience: 0,
      isActive: true,
      serviceIds: [],
      createdAt: '',
    }));
  }, [schedulesMap]);

  // The lawyer IDs that the calendar needs to consider for "is this slot free":
  //   - all lawyers when `lawyerId === 'all'`
  //   - just the selected one otherwise
  const targetLawyerIds = useMemo(() => {
    if (lawyerId === 'all') {
      return lawyers.map((l) => l.id);
    }
    return lawyers.filter((l) => l.id === lawyerId).map((l) => l.id);
  }, [lawyers, lawyerId]);

  const days = useMemo((): DayAvailability[] => {
    const dates = getWeekDates(weekStart);

    return dates.map((date) => {
      const dow = (() => {
        // 0=Sun .. 6=Sat — matches BE LawyerSchedule.dayOfWeek convention
        const [y, m, d] = date.split('-').map(Number);
        return new Date(y, m - 1, d).getDay();
      })();

      const slots: AvailabilitySlot[] = DEFAULT_SLOTS.map((slot) => {
        const slotStart = timeToMinutes(slot.start);
        const slotEnd = timeToMinutes(slot.end);

        // Filter bookings down to: matching date, matching target lawyer(s),
        // not cancelled, and overlapping this slot.
        const overlappingBookings = bookings
          .filter((b) => b.status !== 'CANCELLED' && b.scheduledAt)
          .filter((b) => {
            const { ymd, hm } = splitLocal(new Date(b.scheduledAt));
            if (ymd !== date) return false;
            const bookingStart = timeToMinutes(hm);
            if (!isBookingInSlot(bookingStart, b.durationMinutes ?? 60, slotStart, slotEnd)) {
              return false;
            }
            if (lawyerId !== 'all') {
              // Specific lawyer: booking must belong to that lawyer.
              if (!b.lawyerId || b.lawyerId !== lawyerId) return false;
            } else {
              // "All lawyers" view: bookings are split across all lawyers; we
              // assign each to a specific cell only when there's no lawyerId
              // mismatch with one of our tracked lawyers.
              if (b.lawyerId && !targetLawyerIds.includes(b.lawyerId)) return false;
            }
            return true;
          })
          .map((b) => {
            const { hm } = splitLocal(new Date(b.scheduledAt));
            return {
              bookingId: b.id,
              customerName: b.clientName,
              lawyerId: b.lawyerId ?? null,
              lawyerName: b.lawyerName ?? null,
              bookingTime: hm,
            };
          });

        // Per-lawyer off-state map for the cell's date: { lawyerId: isOff }
        const offState: Record<string, boolean> = {};
        for (const lid of targetLawyerIds) {
          const lawyerSched = schedulesMap[lid];
          let isOff = false;
          if (lawyerSched) {
            const daySched = lawyerSched.regular?.find((s) => s.dayOfWeek === dow);
            const override = lawyerSched.overrides?.find((o) => o.overrideDate === date);
            // Off when: regular schedule marks it off, OR an override type=off exists.
            isOff = Boolean(daySched?.isOff) || override?.type === 'off';
          }
          offState[lid] = isOff;
        }

        // Bookings that have a lawyerId (we know who owns them). For the
        // "all lawyers" cell we only consider bookings whose lawyer is in the
        // target set (overlappingBookings already filtered that above).
        const bookedLawyerIds = new Set(
          overlappingBookings
            .map((b) => b.lawyerId)
            .filter((id): id is string => Boolean(id)),
        );

        // Determine if there is at least one target lawyer that can still
        // accept a new booking in this slot.
        const availableLawyerIds = targetLawyerIds.filter(
          (lid) => !offState[lid] && !bookedLawyerIds.has(lid),
        );

        const isAvailable = availableLawyerIds.length > 0;

        return {
          start: slot.start,
          end: slot.end,
          isAvailable,
          bookings: overlappingBookings,
          // Helpful metadata for the cell tooltip / labels.
          availableCount: availableLawyerIds.length,
          offLawyerIds: targetLawyerIds.filter((lid) => offState[lid]),
        };
      });

      return { date, dayOfWeek: dow, slots };
    });
  }, [weekStart, schedulesMap, bookings, targetLawyerIds, lawyerId]);

  return { days, lawyers, isLoading: schedLoading };
}
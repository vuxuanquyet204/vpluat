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
  bookingId?: string;
  customerName?: string;
  bookingTime?: string; // Original booking time for display
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

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay();
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function isBookingInSlot(bookingTime: string, slotStart: string, slotEnd: string): boolean {
  const bookingMinutes = timeToMinutes(bookingTime);
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  // Booking overlaps with slot if it starts within the slot or spans across slot
  return bookingMinutes >= slotStartMinutes && bookingMinutes < slotEndMinutes;
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

  // Build lawyers list from schedules map
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

  // Filter lawyers if specific one selected
  const targetLawyers = useMemo(
    () => (lawyerId === 'all' ? lawyers : lawyers.filter((l) => l.id === lawyerId)),
    [lawyers, lawyerId],
  );

  const days = useMemo((): DayAvailability[] => {
    const dates = getWeekDates(weekStart);

    return dates.map((date) => {
      const dow = getDayOfWeek(date);
      const slots: AvailabilitySlot[] = DEFAULT_SLOTS.map((slot) => {
        // Get all bookings for this date that overlap with this slot
        const overlappingBookings = bookings.filter((b) => {
          if (!b.scheduledAt) return false;
          
          // Convert scheduledAt to local date/time for correct comparison
          const scheduledDate = new Date(b.scheduledAt);
          const bDate = format(scheduledDate, 'yyyy-MM-dd');
          const bTime = format(scheduledDate, 'HH:mm');
          
          // Check date match
          if (bDate !== date) return false;
          
          // Check if booking overlaps with this slot
          if (!isBookingInSlot(bTime, slot.start, slot.end)) return false;
          
          // Check lawyer filter (b.lawyerId is UUID string from API)
          if (lawyerId !== 'all' && b.lawyerId !== lawyerId) return false;
          
          // Skip cancelled bookings
          if (b.status === 'CANCELLED') return false;
          
          return true;
        });

        // Check if lawyer is off on this day (for the primary lawyer in filter)
        let isOff = false;
        if (targetLawyers.length > 0) {
          const primaryLawyer = targetLawyers[0];
          const lawyerSched = schedulesMap[primaryLawyer.id];
          if (lawyerSched) {
            const daySched = lawyerSched.regular?.find((s) => s.dayOfWeek === dow);
            isOff = daySched?.isOff ?? false;
            
            // Check for override
            const override = lawyerSched.overrides?.find(
              (o) => o.overrideDate === date,
            );
            if (override?.type === 'off') {
              isOff = true;
            }
          }
        }

        // If there are overlapping bookings, show the first one
        const conflict = overlappingBookings[0];
        
        return {
          start: slot.start,
          end: slot.end,
          isAvailable: !isOff && !conflict,
          bookingId: conflict?.id,
          customerName: conflict?.clientName,
          bookingTime: conflict?.scheduledAt 
            ? format(new Date(conflict.scheduledAt), 'HH:mm')
            : undefined,
        };
      });

      return { date, dayOfWeek: dow, slots };
    });
  }, [weekStart, schedulesMap, bookings, targetLawyers, lawyerId]);

  return { days, lawyers, isLoading: schedLoading };
}

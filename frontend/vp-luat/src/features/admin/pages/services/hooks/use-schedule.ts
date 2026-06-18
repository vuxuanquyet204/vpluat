'use client';

import { useMemo, useCallback } from 'react';
import { useMockQuery } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import type { LawyerSchedule } from '@/features/admin/types';

export const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
export const DAY_LABELS = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
] as const;

export interface DaySchedule {
  isOff: boolean;
  slots: Array<{ start: string; end: string }>;
}

const DEFAULT_SCHEDULE: Record<number, DaySchedule> = {
  0: { isOff: true, slots: [] },
  1: { isOff: false, slots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  2: { isOff: false, slots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  3: { isOff: false, slots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  4: { isOff: false, slots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  5: { isOff: false, slots: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  6: { isOff: true, slots: [] },
};

export function useLawyerSchedule(lawyerId: string | null | undefined) {
  const { data: allSchedules = [] } = useMockQuery<LawyerSchedule>('lawyer_schedules');

  const scheduleByDay = useMemo(() => {
    const map: Record<number, DaySchedule> = { ...DEFAULT_SCHEDULE };
    if (!lawyerId) return map;
    const mine = allSchedules.filter((s) => s.lawyerId === lawyerId);
    for (const s of mine) {
      map[s.dayOfWeek] = { isOff: s.isOff, slots: s.slots };
    }
    return map;
  }, [lawyerId, allSchedules]);

  const saveSchedule = useCallback(
    async (next: Record<number, DaySchedule>) => {
      if (!lawyerId) return;
      try {
        const existing = allSchedules.filter((s) => s.lawyerId === lawyerId);
        for (const day of DAYS_OF_WEEK) {
          const dow = DAYS_OF_WEEK.indexOf(day);
          const daySched = next[dow];
          const found = existing.find((s) => s.dayOfWeek === dow);
          if (found) {
            MockDB.update<LawyerSchedule>('lawyer_schedules', found.id, {
              isOff: daySched.isOff,
              slots: daySched.slots,
            });
          } else {
            MockDB.insert<LawyerSchedule>('lawyer_schedules', {
              lawyerId,
              dayOfWeek: dow,
              isOff: daySched.isOff,
              slots: daySched.slots,
            } as unknown as LawyerSchedule);
          }
        }
        ghiAudit({
          action: 'update',
          entity: 'lawyer_schedule',
          entityId: lawyerId,
          entityLabel: 'lịch làm việc',
        });
        notifySuccess('Đã lưu lịch làm việc');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu lịch');
      }
    },
    [lawyerId, allSchedules],
  );

  return { scheduleByDay, saveSchedule };
}
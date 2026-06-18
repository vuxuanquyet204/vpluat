'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDB } from '../../../mock/db';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';
import { notifyBookingCancelled } from '../../notifications/lib/notification-bridge';
import type { Booking, BookingStatus } from '../../../types';

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
      const reminders: Booking['reminders'] = [];
      const now = Date.now();
      const dateTime = new Date(`${data.date}T${data.time}:00`).getTime();

      const r = (data as { reminders?: { h24?: boolean; h2?: boolean; m30?: boolean } }).reminders;
      if (r?.h24) reminders.push({ type: '24h', scheduledAt: new Date(dateTime - 24 * 60 * 60 * 1000).toISOString(), sent: false, channel: 'email' });
      if (r?.h2) reminders.push({ type: '2h', scheduledAt: new Date(dateTime - 2 * 60 * 60 * 1000).toISOString(), sent: false, channel: 'sms' });
      if (r?.m30) reminders.push({ type: '30m', scheduledAt: new Date(dateTime - 30 * 60 * 1000).toISOString(), sent: false, channel: 'email' });

      const created = MockDB.insert<Booking>('bookings', {
        ...data,
        reminders,
      } as Booking);
      ghiAudit({ action: 'create', entity: 'booking', entityId: created.id, entityLabel: created.customerName });
      return created;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      notifySuccess('Đã tạo lịch hẹn', `${b.customerName} • ${b.date} ${b.time}`);
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo'),
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Booking> }) => {
      const before = MockDB.getById<Booking>('bookings', vars.id);
      const updated = MockDB.update<Booking>('bookings', vars.id, vars.patch);
      if (before && vars.patch.status && before.status !== vars.patch.status) {
        ghiAudit({
          action: 'status_change',
          entity: 'booking',
          entityId: vars.id,
          entityLabel: updated?.customerName,
          diff: { before: { status: before.status }, after: { status: vars.patch.status } },
        });
        if (vars.patch.status === 'completed' || vars.patch.status === 'cancelled') {
          // Không tạo lead ở đây — caller xử lý
        }
      } else {
        ghiAudit({ action: 'update', entity: 'booking', entityId: vars.id, entityLabel: updated?.customerName });
      }
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}

export function useChangeBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: BookingStatus; cancelledReason?: string }) => {
      const before = MockDB.getById<Booking>('bookings', vars.id);
      const updated = MockDB.update<Booking>('bookings', vars.id, {
        status: vars.status,
        cancelledReason: vars.status === 'cancelled' ? vars.cancelledReason : undefined,
      } as Partial<Booking>);
      ghiAudit({
        action: 'status_change',
        entity: 'booking',
        entityId: vars.id,
        entityLabel: updated?.customerName,
        diff: { before: { status: before?.status }, after: { status: vars.status } },
      });
      return updated;
    },
    onSuccess: (b, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      notifySuccess(`Đã cập nhật trạng thái: ${b?.status}`);
      // NC-04: notify cancel
      if (vars.status === 'cancelled' && b) {
        notifyBookingCancelled(b.customerName, b.date);
      }
    },
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; date: string; time: string }) => {
      const before = MockDB.getById<Booking>('bookings', vars.id);
      const updated = MockDB.update<Booking>('bookings', vars.id, {
        date: vars.date,
        time: vars.time,
      });
      ghiAudit({
        action: 'update',
        entity: 'booking',
        entityId: vars.id,
        entityLabel: updated?.customerName,
        diff: {
          before: { date: before?.date, time: before?.time },
          after: { date: vars.date, time: vars.time },
        },
      });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      notifySuccess('Đã đổi lịch hẹn');
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById<Booking>('bookings', id);
      const ok = MockDB.delete('bookings', id);
      if (ok) ghiAudit({ action: 'delete', entity: 'booking', entityId: id, entityLabel: before?.customerName });
      return ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      notifySuccess('Đã xóa lịch hẹn');
    },
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi, type CreateBookingBody } from '@/lib/api/admin-booking';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';
import { notifyBookingCancelled } from '../../notifications/lib/notification-bridge';
import type { Booking, BookingStatus } from '../../../types';

function toCreateBookingBody(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): CreateBookingBody {
  const dateTime = new Date(`${data.date}T${data.time || '09:00'}:00`).toISOString();
  return {
    clientName: data.customerName,
    clientEmail: data.customerEmail,
    clientPhone: data.customerPhone,
    lawyerId: data.lawyer,
    serviceId: data.service,
    scheduledAt: dateTime,
    durationMinutes: data.durationMinutes ?? 60,
    meetingType: data.method?.toUpperCase() ?? 'OFFICE',
    source: 'ADMIN',
  };
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
      const body = toCreateBookingBody(data);
      const result = await bookingApi.adminCreate(body);
      ghiAudit({ action: 'create', entity: 'booking', entityId: result.id, entityLabel: result.clientName });
      return result;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã tạo lịch hẹn', `${b.clientName} • ${new Date(b.scheduledAt).toLocaleString('vi-VN')}`);
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo'),
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Booking> }) => {
      if (vars.patch.status) {
        const result = await bookingApi.updateStatus(vars.id, vars.patch.status.toUpperCase(), vars.patch.notes);
        ghiAudit({
          action: 'status_change',
          entity: 'booking',
          entityId: vars.id,
          entityLabel: result.clientName,
          diff: { before: {}, after: { status: vars.patch.status } },
        });
        return result;
      }
      return bookingApi.get(vars.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã cập nhật lịch hẹn');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật'),
  });
}

export function useChangeBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: BookingStatus; cancelledReason?: string }) => {
      const result = await bookingApi.updateStatus(
        vars.id,
        vars.status.toUpperCase(),
        vars.cancelledReason,
      );
      ghiAudit({
        action: 'status_change',
        entity: 'booking',
        entityId: vars.id,
        entityLabel: result.clientName,
        diff: {
          before: {},
          after: { status: vars.status },
        },
      });
      return { result, cancelledReason: vars.cancelledReason };
    },
    onSuccess: ({ result, cancelledReason }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess(`Đã cập nhật trạng thái: ${result.status}`);
      if (result.status === 'CANCELLED') {
        notifyBookingCancelled(result.clientName, result.scheduledAt);
      }
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật'),
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; date: string; time: string; reason?: string }) => {
      const newScheduledAt = new Date(`${vars.date}T${vars.time}:00`).toISOString();
      const result = await bookingApi.reschedule(vars.id, newScheduledAt, undefined, vars.reason);
      ghiAudit({
        action: 'update',
        entity: 'booking',
        entityId: vars.id,
        entityLabel: result.clientName,
        diff: {
          before: {},
          after: { scheduledAt: newScheduledAt },
        },
      });
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã đổi lịch hẹn');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể đổi lịch'),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; reason?: string }) => {
      const result = await bookingApi.cancel(vars.id, vars.reason);
      ghiAudit({
        action: 'cancel',
        entity: 'booking',
        entityId: vars.id,
        entityLabel: result.clientName,
      });
      return result;
    },
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã hủy lịch hẹn');
      notifyBookingCancelled(b.clientName, b.scheduledAt);
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể hủy'),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Backend doesn't have delete endpoint, so we cancel instead
      await bookingApi.updateStatus(id, 'CANCELLED', 'Deleted by admin');
      ghiAudit({ action: 'delete', entity: 'booking', entityId: id });
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã xóa lịch hẹn');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa'),
  });
}

export function useUpdateReminders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; reminders: Array<{ type: string; enabled: boolean; channel: string }> }) => {
      const result = await bookingApi.updateReminders(vars.id, vars.reminders as Parameters<typeof bookingApi.updateReminders>[1]);
      return { id: vars.id, result };
    },
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ['booking-reminders', id] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã cập nhật reminder');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật reminder'),
  });
}

export function useSendConfirmationEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return bookingApi.sendConfirmationEmail(id);
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      notifySuccess('Đã gửi email xác nhận');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gửi email'),
  });
}

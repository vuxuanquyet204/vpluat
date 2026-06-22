// lib/api/admin-booking.ts
// Booking (appointment) + lawyer schedule + reminders API surface.

import { api } from './hooks';
import type { PageResponse } from './hooks';

// ============================================================
// Types
// ============================================================

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  lawyerId: string;
  lawyerName?: string;
  serviceId: string;
  serviceName?: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: string;
  status: string;
  cancelReason?: string;
  internalNotes?: string;
  source?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LawyerSchedule {
  id: string;
  lawyerId: string;
  lawyerName?: string;
  dayOfWeek: number;
  isOff: boolean;
  slots: TimeSlot[];
  effectiveFrom?: string;
  effectiveTo?: string;
  note?: string;
}

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string;
}

export interface LawyerScheduleOverride {
  id: string;
  lawyerId: string;
  lawyerName?: string;
  overrideDate: string;
  type: 'off' | 'custom';
  slots: TimeSlot[];
  reason?: string;
  createdAt: string;
}

export interface LawyerScheduleResponse {
  regular: LawyerSchedule[];
  overrides: LawyerScheduleOverride[];
}

export interface BookingHistoryEntry {
  id: string;
  appointmentId: string;
  type: 'create' | 'update' | 'status_change' | 'reschedule' | 'cancel' | 'reminder_sent';
  fromValue?: string;
  toValue?: string;
  reason?: string;
  actorId?: string;
  actorName?: string;
  createdAt: string;
}

export interface ReminderConfig {
  type: '24h' | '2h' | '30min';
  enabled: boolean;
  channel: 'email' | 'sms' | 'in_app';
}

export interface BookingReminderConfig {
  appointmentId: string;
  reminders: ReminderConfig[];
}

export interface BookingStats {
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayAppointments: Appointment[];
}

export interface SlotUpdate {
  dayOfWeek: number;
  isOff: boolean;
  slots: TimeSlot[];
  note?: string;
}

// ============================================================
// Booking API
// ============================================================

export const bookingApi = {
  // List bookings with pagination
  list: (params?: { page?: number; size?: number; status?: string }) =>
    api.get<PageResponse<Appointment>>(`/bookings`, params),

  // Get single booking
  get: (id: string) =>
    api.get<Appointment>(`/bookings/${id}`),

  // Calendar view (bookings in date range)
  calendar: (params: { lawyerId?: string; from: string; to: string }) =>
    api.get<Appointment[]>(`/bookings/calendar`, params),

  // Reschedule booking
  reschedule: (id: string, newScheduledAt: string, durationMinutes?: number, reason?: string) =>
    api.post<Appointment>(`/bookings/${id}/reschedule`, {
      newScheduledAt,
      durationMinutes,
      reason,
    }),

  // Update booking status
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch<Appointment>(`/bookings/${id}/status`, { status, notes }),

  // Cancel booking
  cancel: (id: string, reason?: string) =>
    api.post<Appointment>(`/bookings/${id}/cancel?reason=${encodeURIComponent(reason ?? '')}`),

  // Admin create (no OTP)
  adminCreate: (body: CreateBookingBody) =>
    api.post<Appointment>(`/bookings/admin`, body),

  // Booking history/audit trail
  getHistory: (id: string) =>
    api.get<BookingHistoryEntry[]>(`/bookings/${id}/history`),

  // Reminder config
  getReminders: (id: string) =>
    api.get<BookingReminderConfig>(`/bookings/${id}/reminders`),

  updateReminders: (id: string, reminders: ReminderConfig[]) =>
    api.patch<BookingReminderConfig>(`/bookings/${id}/reminders`, { reminders }),

  // Send confirmation email
  sendConfirmationEmail: (id: string) =>
    api.post<{ message: string }>(`/bookings/${id}/send-confirmation-email`),

  // Stats
  getStats: (date?: string) =>
    api.get<BookingStats>(`/bookings/admin/stats`, date ? { date } : {}),
};

export interface CreateBookingBody {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  lawyerId: string;
  serviceId: string;
  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;
  meetingType?: string;
  source?: string;
}

// ============================================================
// Lawyer Schedule API
// ============================================================

export const lawyerScheduleApi = {
  // Get weekly schedule for one lawyer
  getSchedule: (lawyerId: string) =>
    api.get<LawyerSchedule[]>(`/admin/lawyers/${lawyerId}/schedule`),

  // Batch update weekly schedule
  saveSchedule: (lawyerId: string, updates: SlotUpdate[]) =>
    api.put<LawyerSchedule[]>(`/admin/lawyers/${lawyerId}/schedule`, updates),

  // Get all lawyers' schedules in date range
  getAllSchedules: (from: string, to: string) =>
    api.get<Record<string, LawyerScheduleResponse>>(`/admin/lawyers/schedules`, { from, to }),

  // Create schedule override
  createOverride: (lawyerId: string, request: {
    overrideDate: string;
    type: 'off' | 'custom';
    slots?: TimeSlot[];
    reason?: string;
  }) =>
    api.post<LawyerScheduleOverride>(
      `/admin/lawyers/${lawyerId}/schedule/override`,
      request
    ),

  // Delete schedule override
  deleteOverride: (lawyerId: string, date: string) =>
    api.del<void>(`/admin/lawyers/${lawyerId}/schedule/override?date=${date}`),
};

import { z } from 'zod';

const isoDate = z
  .string()
  .min(1, 'Chọn ngày')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày không hợp lệ');

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ không hợp lệ (HH:mm)');

export const bookingSchema = z.object({
  customerName: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  customerEmail: z.string().email('Email không hợp lệ'),
  customerPhone: z
    .string()
    .min(8, 'SĐT tối thiểu 8 số')
    .regex(/^[\d\s\-+]+$/, 'SĐT chỉ chứa số và ký tự hợp lệ'),
  leadId: z.string().optional(),
  service: z.string().min(1, 'Chọn dịch vụ'),
  lawyer: z.string().min(1, 'Chọn luật sư'),
  method: z.enum(['office', 'online', 'phone']),
  date: isoDate,
  time: hhmm,
  durationMinutes: z.number().int().min(15).max(240).optional(),
  notes: z.string().max(2000).optional(),
  reminders: z
    .array(
      z.object({
        type: z.enum(['24h', '2h', '30m']),
        scheduledAt: z.string(),
        sent: z.boolean(),
        channel: z.enum(['email', 'sms', 'notification']),
      })
    )
    .optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const rescheduleSchema = z.object({
  date: isoDate,
  time: hhmm,
});

export const cancelSchema = z.object({
  cancelledReason: z.string().min(2, 'Nhập lý do hủy').max(500),
});

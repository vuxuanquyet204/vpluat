import { z } from 'zod';

const daysOffSchema = z.array(z.string());

export const generalSettingsSchema = z.object({
  siteName: z.string().min(2, 'Tên site tối thiểu 2 ký tự').max(80),
  hotline: z.string().min(8, 'Hotline không hợp lệ').max(20),
  email: z.string().email('Email không hợp lệ'),
  address: z.string().min(5).max(200),
  timezone: z.string().min(1),
  language: z.enum(['vi', 'en']),
  workingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
    daysOff: daysOffSchema,
  }),
});

export const bookingSettingsSchema = z.object({
  slotDuration: z.number().int().min(15).max(120),
  bookingLeadTime: z.number().int().min(0).max(168),
  maxBookingsPerDay: z.number().int().min(1).max(100),
  allowOnline: z.boolean(),
  allowPhone: z.boolean(),
  autoConfirm: z.boolean(),
});

export const smtpSettingsSchema = z.object({
  fromName: z.string().min(2).max(80),
  fromEmail: z.string().email('Email không hợp lệ'),
  replyTo: z.string().email('Reply-to không hợp lệ').or(z.literal('')),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().min(1).max(65535),
  smtpUser: z.string().min(1),
  smtpPassword: z.string().optional().or(z.literal('')),
  useTLS: z.boolean(),
});

export const themeSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu hex không hợp lệ'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.enum(['Inter', 'Roboto', 'Poppins', 'Be Vietnam Pro', 'Manrope']),
  logoUrl: z.string().url().or(z.literal('')),
  faviconUrl: z.string().url().or(z.literal('')),
});

export const integrationsSettingsSchema = z.object({
  sentryDsn: z.string().or(z.literal('')),
  posthogKey: z.string().or(z.literal('')),
  googleAnalyticsId: z.string().or(z.literal('')),
  chatbotWebhookUrl: z.string().url().or(z.literal('')),
});

export const auditFilterSchema = z.object({
  search: z.string().default(''),
  actorId: z.string().default('all'),
  action: z.string().default('all'),
  entity: z.string().default('all'),
  dateFrom: z.string().default(''),
  dateTo: z.string().default(''),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
export type BookingSettingsValues = z.infer<typeof bookingSettingsSchema>;
export type SmtpSettingsValues = z.infer<typeof smtpSettingsSchema>;
export type ThemeSettingsValues = z.infer<typeof themeSettingsSchema>;
export type IntegrationsSettingsValues = z.infer<typeof integrationsSettingsSchema>;
export type AuditFilterValues = z.infer<typeof auditFilterSchema>;

export const ALL_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export const FONT_OPTIONS: Array<{ value: 'Inter' | 'Roboto' | 'Poppins' | 'Be Vietnam Pro' | 'Manrope'; label: string }> = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro' },
  { value: 'Manrope', label: 'Manrope' },
];

export const TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (GMT+7)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'UTC', label: 'UTC' },
];

export const LANGUAGES: Array<{ value: 'vi' | 'en'; label: string }> = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

export const SLOT_DURATIONS: Array<{ value: number; label: string }> = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '60 phút' },
];
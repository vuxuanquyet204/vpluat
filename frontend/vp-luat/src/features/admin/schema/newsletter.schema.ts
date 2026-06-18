import { z } from 'zod';

// ─── Subscriber ─────────────────────────────────────────────────────────
export const subscriberSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().max(80).optional().or(z.literal('')),
  status: z.enum(['active', 'unsubscribed']),
  source: z.string().max(40).optional().or(z.literal('')),
  tags: z.array(z.string()),
});

export type SubscriberFormValues = z.infer<typeof subscriberSchema>;

// ─── Campaign ───────────────────────────────────────────────────────────
export const campaignSchema = z.object({
  name: z.string().min(2, 'Tên campaign tối thiểu 2 ký tự').max(120),
  subject: z.string().min(2, 'Subject tối thiểu 2 ký tự').max(180),
  body: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  segment: z.enum(['all', 'fdi', 'realestate', 'custom']),
  customEmails: z.array(z.string().email('Email không hợp lệ')),
  scheduledAt: z.string().optional().or(z.literal('')),
  templateId: z.string().optional().or(z.literal('')),
});

export type CampaignFormValues = z.infer<typeof campaignSchema>;

// ─── Template ───────────────────────────────────────────────────────────
export const templateSchema = z.object({
  name: z.string().min(2, 'Tên template tối thiểu 2 ký tự').max(80),
  subject: z.string().min(2).max(180),
  body: z.string().min(5),
  description: z.string().max(500).optional().or(z.literal('')),
  isDefault: z.boolean(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

// ─── Import CSV ─────────────────────────────────────────────────────────
export interface ImportedRow {
  email: string;
  name?: string;
  valid: boolean;
  error?: string;
}
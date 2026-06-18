import { z } from 'zod';

// ─── Reply form ─────────────────────────────────────────────────────────
export const replySchema = z.object({
  reply: z
    .string()
    .min(2, 'Phản hồi tối thiểu 2 ký tự')
    .max(1000, 'Phản hồi tối đa 1000 ký tự'),
});

export type ReplyFormValues = z.infer<typeof replySchema>;

// ─── Report resolve ─────────────────────────────────────────────────────
export const resolveReportSchema = z.object({
  action: z.enum(['delete_review', 'reject_review', 'dismiss_report']),
  note: z.string().max(500).optional().or(z.literal('')),
});

export type ResolveReportFormValues = z.infer<typeof resolveReportSchema>;
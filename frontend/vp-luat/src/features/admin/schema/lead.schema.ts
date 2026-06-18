import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(80),
  phone: z
    .string()
    .min(8, 'Số điện thoại không hợp lệ')
    .regex(/^[\d\s\-+]+$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  service: z.string().min(1, 'Chọn dịch vụ'),
  source: z.enum(['facebook', 'google_ads', 'organic', 'chatbot', 'referral', 'other']),
  status: z.enum(['new', 'contacted', 'progress', 'converted', 'lost']),
  assignedTo: z.string().min(1, 'Chọn người phụ trách'),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

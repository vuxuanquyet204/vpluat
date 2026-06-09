import { z } from 'zod';

export const bookingFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ và tên đầy đủ'),
  phone: z
    .string()
    .trim()
    .regex(/^(0[1-9]\d{8,9})$/, 'Vui lòng nhập số điện thoại hợp lệ'),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Vui lòng nhập email hợp lệ'),
  issueSummary: z.string().trim().min(10, 'Vui lòng mô tả ngắn gọn vấn đề của bạn'),
  agreedToTerms: z.boolean().refine((value) => value === true, 'Bạn cần đồng ý điều khoản để tiếp tục'),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

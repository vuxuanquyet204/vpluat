import { z } from 'zod';

// ─── Service ────────────────────────────────────────────────────────────
// Note: form dùng input number → value là string. useForm dùng valueAsNumber để ép.
export const serviceSchema = z.object({
  name: z.string().min(2, 'Tên dịch vụ tối thiểu 2 ký tự').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  category: z.string().min(1, 'Chọn danh mục'),
  price: z.number().int().min(0).optional(),
  duration: z.number().int().min(1).optional(),
  isActive: z.boolean(),
  lawyerIds: z.array(z.string()),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

// ─── Lawyer ─────────────────────────────────────────────────────────────
export const lawyerSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(80),
  title: z.string().min(1, 'Chức danh không được trống').max(80),
  bio: z.string().max(500).optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
  specialties: z.array(z.string()),
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .min(9, 'SĐT không hợp lệ')
    .max(15)
    .regex(/^[0-9\s+()-]+$/, 'SĐT chỉ gồm chữ số và ký tự + - ( )'),
  experience: z.number().int().min(0).max(80),
  isActive: z.boolean(),
  serviceIds: z.array(z.string()),
});

export type LawyerFormValues = z.infer<typeof lawyerSchema>;
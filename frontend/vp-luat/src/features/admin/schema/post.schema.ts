import { z } from 'zod';

const HEX_COLOR = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// ─── SEO ─────────────────────────────────────────────────────────────────
export const seoSchema = z.object({
  metaTitle: z.string().max(70, 'Meta title tối đa 70 ký tự').optional().or(z.literal('')),
  metaDescription: z.string().max(160, 'Meta desc tối đa 160 ký tự').optional().or(z.literal('')),
  ogImage: z.string().optional().or(z.literal('')),
  canonicalUrl: z.string().optional().or(z.literal('')),
  noindex: z.boolean().default(false),
});

export type SeoFormValues = z.infer<typeof seoSchema>;

// ─── Post ────────────────────────────────────────────────────────────────
export const postSchema = z.object({
  title: z.string().min(3, 'Tiêu đề tối thiểu 3 ký tự').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z
    .string()
    .min(3, 'Slug tối thiểu 3 ký tự')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  excerpt: z.string().max(500, 'Mô tả ngắn tối đa 500 ký tự').optional().or(z.literal('')),
  content: z.string().min(1, 'Nội dung không được trống'),
  category: z.string().min(1, 'Chọn danh mục'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'scheduled']),
  thumbnail: z.string().optional().or(z.literal('')),
  scheduledAt: z.string().optional().or(z.literal('')),
  seo: seoSchema.optional(),
});

export type PostFormValues = z.infer<typeof postSchema>;

// ─── Category ───────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục tối thiểu 2 ký tự').max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  description: z.string().max(300).optional().or(z.literal('')),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Tag ────────────────────────────────────────────────────────────────
export const tagSchema = z.object({
  name: z.string().min(2, 'Tên tag tối thiểu 2 ký tự').max(40),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  color: z
    .string()
    .min(1, 'Chọn màu')
    .regex(HEX_COLOR, 'Màu phải là mã hex hợp lệ (vd: #1E3A5F)'),
});

export type TagFormValues = z.infer<typeof tagSchema>;
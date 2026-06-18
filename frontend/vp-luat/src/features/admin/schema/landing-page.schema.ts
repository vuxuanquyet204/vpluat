import { z } from 'zod';

export const landingSeoSchema = z.object({
  metaTitle: z.string().max(70, 'Meta title tối đa 70 ký tự'),
  metaDescription: z.string().max(160, 'Meta description tối đa 160 ký tự'),
  noindex: z.boolean(),
  ogImage: z.string().url('Phải là URL hợp lệ').optional().or(z.literal('')),
});

export const heroPropsSchema = z.object({
  headline: z.string().min(2, 'Headline tối thiểu 2 ký tự').max(200),
  subheadline: z.string().max(300).optional().or(z.literal('')),
  ctaText: z.string().max(40).optional().or(z.literal('')),
  ctaLink: z.string().max(500).optional().or(z.literal('')),
  backgroundImage: z.string().url().optional().or(z.literal('')),
  align: z.enum(['left', 'center', 'right']).optional(),
  eyebrow: z.string().max(40).optional().or(z.literal('')),
});

export const textPropsSchema = z.object({
  content: z.string().min(1, 'Nội dung không được trống').max(5000),
  maxWidth: z.number().int().min(200).max(2000).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
});

export const imagePropsSchema = z.object({
  src: z.string().url('Phải là URL hợp lệ'),
  alt: z.string().min(1, 'Alt bắt buộc cho SEO').max(200),
  caption: z.string().max(200).optional().or(z.literal('')),
  width: z.number().int().min(50).max(2000).optional(),
  rounded: z.boolean().optional(),
});

export const ctaPropsSchema = z.object({
  text: z.string().min(1, 'Text không được trống').max(40),
  link: z.string().min(1, 'Link không được trống').max(500),
  variant: z.enum(['primary', 'secondary', 'outline']).optional(),
  icon: z.string().max(40).optional().or(z.literal('')),
});

export const leadFormPropsSchema = z.object({
  fields: z.array(z.string()).min(1, 'Cần ít nhất 1 field').max(10),
  submitText: z.string().min(1, 'Submit text bắt buộc').max(40),
  successMessage: z.string().max(200).optional().or(z.literal('')),
  redirectTo: z.string().max(500).optional().or(z.literal('')),
});

export const testimonialsPropsSchema = z.object({
  limit: z.number().int().min(1).max(50),
  layout: z.enum(['grid', 'carousel']).optional(),
  minRating: z.number().int().min(1).max(5).optional(),
});

export const pricingPropsSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'Chọn ít nhất 1 dịch vụ'),
  showButton: z.boolean().optional(),
  title: z.string().max(100).optional().or(z.literal('')),
});

export const reviewsPropsSchema = z.object({
  limit: z.number().int().min(1).max(50),
  layout: z.enum(['grid', 'list']).optional(),
  showRating: z.boolean().optional(),
  serviceId: z.string().optional().or(z.literal('')),
});

export const faqPropsSchema = z.object({
  title: z.string().max(100).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        question: z.string().min(2, 'Câu hỏi tối thiểu 2 ký tự').max(200),
        answer: z.string().min(2, 'Câu trả lời tối thiểu 2 ký tự').max(1000),
      }),
    )
    .min(1, 'Cần ít nhất 1 FAQ')
    .max(50, 'Tối đa 50 FAQs'),
});

export const newsPropsSchema = z.object({
  category: z.string().optional().or(z.literal('')),
  limit: z.number().int().min(1).max(50),
  layout: z.enum(['grid', 'list']).optional(),
});

export const lawyersPropsSchema = z.object({
  specialties: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50),
  showSchedule: z.boolean().optional(),
});

export const mapPropsSchema = z.object({
  embedUrl: z.string().url('Phải là URL Google Maps hợp lệ'),
  height: z.number().int().min(200).max(800).optional(),
  title: z.string().max(100).optional().or(z.literal('')),
});

export const contactPropsSchema = z.object({
  address: z.string().min(1, 'Địa chỉ bắt buộc').max(300),
  phone: z.string().min(8, 'SĐT tối thiểu 8 ký tự').max(20),
  email: z.string().email('Email không hợp lệ'),
  workingHours: z.string().max(200).optional().or(z.literal('')),
  showMap: z.boolean().optional(),
});

export const landingPageFormSchema = z.object({
  title: z.string().min(2, 'Tiêu đề tối thiểu 2 ký tự').max(120),
  slug: z
    .string()
    .min(2, 'Slug tối thiểu 2 ký tự')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa a-z, 0-9 và dấu -'),
  description: z.string().max(300).optional().or(z.literal('')),
  targetAudience: z.enum(['fdi', 'enterprise', 'individual', 'startup', 'all']),
  status: z.enum(['draft', 'published', 'archived']),
  seo: landingSeoSchema,
});

export type LandingPageFormValues = z.infer<typeof landingPageFormSchema>;
export type HeroFormValues = z.infer<typeof heroPropsSchema>;
export type TextFormValues = z.infer<typeof textPropsSchema>;
export type ImageFormValues = z.infer<typeof imagePropsSchema>;
export type CtaFormValues = z.infer<typeof ctaPropsSchema>;
export type LeadFormBlockFormValues = z.infer<typeof leadFormPropsSchema>;
export type TestimonialsFormValues = z.infer<typeof testimonialsPropsSchema>;
export type PricingFormValues = z.infer<typeof pricingPropsSchema>;
export type ReviewsFormValues = z.infer<typeof reviewsPropsSchema>;
export type FaqFormValues = z.infer<typeof faqPropsSchema>;
export type NewsFormValues = z.infer<typeof newsPropsSchema>;
export type LawyersFormValues = z.infer<typeof lawyersPropsSchema>;
export type MapFormValues = z.infer<typeof mapPropsSchema>;
export type ContactFormValues = z.infer<typeof contactPropsSchema>;
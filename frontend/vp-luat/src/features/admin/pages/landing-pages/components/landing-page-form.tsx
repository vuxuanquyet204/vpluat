'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { Modal } from '@/features/admin/shared';
import { FormFieldInput, FormFieldTextarea } from '@/features/admin/components';
import {
  landingPageFormSchema,
  type LandingPageFormValues,
} from '@/features/admin/schema';
import type { LandingPage } from '@/features/admin/types';

interface LandingPageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: LandingPageFormValues) => Promise<void> | void;
  initial: LandingPage | null;
  isLoading?: boolean;
}

const DEFAULT: LandingPageFormValues = {
  title: '',
  slug: '',
  description: '',
  targetAudience: 'all',
  status: 'draft',
  seo: {
    metaTitle: '',
    metaDescription: '',
    noindex: false,
    ogImage: '',
  },
};

const AUDIENCE_OPTIONS: Array<{ value: LandingPage['targetAudience']; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'fdi', label: 'FDI / Đầu tư' },
  { value: 'enterprise', label: 'Doanh nghiệp' },
  { value: 'individual', label: 'Cá nhân' },
  { value: 'startup', label: 'Startup' },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function LandingPageForm({
  isOpen,
  onClose,
  onSubmit,
  initial,
  isLoading,
}: LandingPageFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LandingPageFormValues>({
    resolver: zodResolver(landingPageFormSchema),
    defaultValues: DEFAULT,
  });

  const title = watch('title');

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      reset({
        title: initial.title,
        slug: initial.slug,
        description: initial.description ?? '',
        targetAudience: initial.targetAudience,
        status: initial.status,
        seo: {
          metaTitle: initial.seo.metaTitle,
          metaDescription: initial.seo.metaDescription,
          noindex: initial.seo.noindex,
          ogImage: initial.seo.ogImage ?? '',
        },
      });
    } else {
      reset(DEFAULT);
    }
  }, [isOpen, initial, reset]);

  // Auto-generate slug từ title nếu chưa chỉnh
  useEffect(() => {
    if (!initial && title) {
      setValue('slug', slugify(title), { shouldValidate: false });
      if (!watch('seo.metaTitle')) {
        setValue('seo.metaTitle', title, { shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? `Sửa — ${initial.title}` : 'Tạo landing page mới'}
      size="md"
      footer={
        <>
          <button type="button" className="action-btn" onClick={onClose} disabled={isLoading}>
            <X size={12} /> Hủy
          </button>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Save size={12} /> {initial ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormFieldInput
            label="Tiêu đề"
            required
            placeholder="VD: Tư vấn FDI 2025"
            {...register('title')}
            error={errors.title?.message}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormFieldInput
              label="Slug (URL)"
              required
              placeholder="tu-van-fdi-2025"
              {...register('slug')}
              error={errors.slug?.message}
              hint="/lp/{slug}"
            />
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--gray-700)',
                  marginBottom: 6,
                }}
              >
                Đối tượng
              </label>
              <select
                className="action-btn"
                style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}
                {...register('targetAudience')}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormFieldTextarea
            label="Mô tả ngắn"
            rows={2}
            placeholder="Mô tả ngắn cho landing page..."
            {...register('description')}
            error={errors.description?.message}
          />

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                marginBottom: 6,
              }}
            >
              Trạng thái
            </label>
            <select
              className="action-btn"
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem' }}
              {...register('status')}
            >
              <option value="draft">Nháp</option>
              <option value="published">Live (Publish)</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>

          <div
            style={{
              padding: 10,
              background: 'var(--gray-50)',
              borderRadius: 8,
              border: '1px solid var(--gray-200)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--gray-700)',
                marginBottom: 8,
              }}
            >
              SEO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FormFieldInput
                label="Meta title"
                placeholder="Tiêu đề SEO (50-60 ký tự)"
                {...register('seo.metaTitle')}
                error={errors.seo?.metaTitle?.message}
              />
              <FormFieldTextarea
                label="Meta description"
                rows={2}
                placeholder="Mô tả SEO (140-160 ký tự)"
                {...register('seo.metaDescription')}
                error={errors.seo?.metaDescription?.message}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.78rem',
                  color: 'var(--gray-700)',
                }}
              >
                <input type="checkbox" {...register('seo.noindex')} />
                Không cho index (noindex)
              </label>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
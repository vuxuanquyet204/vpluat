'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMockQuery,
  useCreate,
  useUpdate,
  useDelete,
  ghiAudit,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type {
  LandingPage,
  LandingBlock,
  LandingBlockType,
  LandingPageStatus,
} from '@/features/admin/types';
import type { LandingPageFormValues } from '@/features/admin/schema';

const SORT = { by: 'updatedAt' as const, dir: 'desc' as const };

export function useLandingPages() {
  const { data = [], ...rest } = useMockQuery<LandingPage>('landing_pages', undefined, SORT);
  const counts = useMemo(() => {
    const c = { total: data.length, published: 0, draft: 0, archived: 0, variants: 0 };
    for (const p of data) {
      if (p.status === 'published') c.published += 1;
      else if (p.status === 'draft') c.draft += 1;
      else c.archived += 1;
      if (p.isVariant) c.variants += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useLandingPage(id: string | null) {
  return useMockQuery<LandingPage>(
    'landing_pages',
    id ? (r) => r.id === id : undefined,
  );
}

export function useCreateLandingPage() {
  return useCreate<LandingPage>('landing_pages', 'landing_page');
}

export function useUpdateLandingPage() {
  return useUpdate<LandingPage>('landing_pages', 'landing_page');
}

export function useDeleteLandingPage() {
  return useDelete('landing_pages', 'landing_page');
}

export function usePublishLandingPage() {
  const qc = useQueryClient();
  return useCallback(async (id: string) => {
    const before = MockDB.getById<LandingPage>('landing_pages', id);
    if (!before) {
      notifyError('Lỗi', 'Không tìm thấy landing page');
      return;
    }
    MockDB.update<LandingPage>('landing_pages', id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['admin', 'landing_pages'] });
    ghiAudit({
      action: 'publish',
      entity: 'landing_page',
      entityId: id,
      entityLabel: before.title,
      diff: { before: { status: before.status }, after: { status: 'published' } },
    });
    notifySuccess(`Đã publish "${before.title}"`);
  }, [qc]);
}

export function useUnpublishLandingPage() {
  const qc = useQueryClient();
  return useCallback(async (id: string) => {
    const before = MockDB.getById<LandingPage>('landing_pages', id);
    if (!before) return;
    MockDB.update<LandingPage>('landing_pages', id, {
      status: 'draft',
      updatedAt: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['admin', 'landing_pages'] });
    ghiAudit({
      action: 'update',
      entity: 'landing_page',
      entityId: id,
      entityLabel: before.title,
      diff: { before: { status: before.status }, after: { status: 'draft' } },
    });
    notifySuccess(`Đã chuyển "${before.title}" về draft`);
  }, [qc]);
}

export function useUpdateLandingBlocks() {
  const qc = useQueryClient();
  return useCallback(
    async (id: string, blocks: LandingBlock[]) => {
      MockDB.update<LandingPage>('landing_pages', id, {
        blocks,
        updatedAt: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'landing_pages'] });
    },
    [qc],
  );
}

export function useDuplicateLandingPage() {
  const qc = useQueryClient();
  return useCallback(async (id: string) => {
    const src = MockDB.getById<LandingPage>('landing_pages', id);
    if (!src) {
      notifyError('Lỗi', 'Không tìm thấy landing page');
      return null;
    }
    const newId = `lp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSlug = `${src.slug}-copy-${Math.random().toString(36).slice(2, 5)}`;
    const dup: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${src.title} (bản sao)`,
      slug: newSlug,
      description: src.description,
      targetAudience: src.targetAudience,
      status: 'draft',
      isVariant: false,
      blocks: src.blocks.map((b) => ({ ...b, id: `${b.id}-${Math.random().toString(36).slice(2, 5)}` })),
      seo: { ...src.seo },
      analytics: {
        views: 0,
        conversions: 0,
        ctr: 0,
        bounceRate: 0,
        dailyViews: [],
      },
    };
    MockDB.insert('landing_pages', { ...dup, id: newId });
    qc.invalidateQueries({ queryKey: ['admin', 'landing_pages'] });
    ghiAudit({
      action: 'create',
      entity: 'landing_page',
      entityId: newId,
      entityLabel: dup.title,
      diff: { before: { sourceId: id }, after: { title: dup.title, slug: newSlug } },
    });
    notifySuccess(`Đã nhân bản "${src.title}"`);
    return newId;
  }, [qc]);
}

export function useCreateVariant() {
  const qc = useQueryClient();
  return useCallback(async (parentId: string) => {
    const parent = MockDB.getById<LandingPage>('landing_pages', parentId);
    if (!parent) {
      notifyError('Lỗi', 'Không tìm thấy landing page gốc');
      return null;
    }
    const newId = `lp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const variant: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${parent.title} (Variant B)`,
      slug: `${parent.slug}-b`,
      description: parent.description,
      targetAudience: parent.targetAudience,
      status: 'draft',
      isVariant: true,
      parentPageId: parent.id,
      variantLabel: 'B',
      blocks: parent.blocks.map((b) => ({ ...b, id: `${b.id}-${Math.random().toString(36).slice(2, 5)}` })),
      seo: { ...parent.seo },
      analytics: {
        views: 0,
        conversions: 0,
        ctr: 0,
        bounceRate: 0,
        dailyViews: [],
      },
    };
    MockDB.insert('landing_pages', { ...variant, id: newId });
    qc.invalidateQueries({ queryKey: ['admin', 'landing_pages'] });
    ghiAudit({
      action: 'create',
      entity: 'landing_page',
      entityId: newId,
      entityLabel: variant.title,
      diff: { before: { sourceId: parentId }, after: { title: variant.title, parentPageId: parentId } },
    });
    notifySuccess(`Đã tạo Variant B cho "${parent.title}"`);
    return newId;
  }, [qc]);
}

export function useCreateLandingFromTemplate() {
  return useCallback(async (values: LandingPageFormValues): Promise<string | null> => {
    const newId = `lp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const page: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'> = {
      title: values.title,
      slug: values.slug,
      description: values.description,
      targetAudience: values.targetAudience,
      status: values.status,
      isVariant: false,
      seo: values.seo,
      blocks: [],
      analytics: {
        views: 0,
        conversions: 0,
        ctr: 0,
        bounceRate: 0,
        dailyViews: [],
      },
    };
    MockDB.insert('landing_pages', { ...page, id: newId });
    ghiAudit({
      action: 'create',
      entity: 'landing_page',
      entityId: newId,
      entityLabel: values.title,
      diff: { before: { sourceId: '' }, after: { title: values.title, slug: values.slug } },
    });
    return newId;
  }, []);
}

// Block factory — tạo block mới với default props
export function createBlock(type: LandingBlockType): LandingBlock {
  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  switch (type) {
    case 'hero':
      return {
        id,
        type,
        order: 0,
        props: {
          headline: 'Tiêu đề chính',
          subheadline: 'Phụ đề ngắn gọn',
          ctaText: 'Tư vấn ngay',
          ctaLink: '/booking',
          align: 'left',
        },
      };
    case 'text':
      return { id, type, order: 0, props: { content: 'Nhập nội dung...', maxWidth: 800, align: 'left' } };
    case 'image':
      return {
        id,
        type,
        order: 0,
        props: { src: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200', alt: 'Mô tả ảnh' },
      };
    case 'cta':
      return { id, type, order: 0, props: { text: 'Liên hệ tư vấn', link: '/contact', variant: 'primary' } };
    case 'lead-form':
      return {
        id,
        type,
        order: 0,
        props: {
          fields: ['name', 'phone', 'email'],
          submitText: 'Gửi yêu cầu',
          successMessage: 'Cảm ơn anh/chị, chúng tôi sẽ liên hệ trong 24h.',
        },
      };
    case 'testimonials':
      return { id, type, order: 0, props: { limit: 6, layout: 'grid' } };
    case 'pricing':
      return { id, type, order: 0, props: { serviceIds: [], showButton: true } };
    case 'reviews':
      return { id, type, order: 0, props: { limit: 6, layout: 'grid', showRating: true } };
    case 'faq':
      return {
        id,
        type,
        order: 0,
        props: {
          title: 'Câu hỏi thường gặp',
          items: [
            { question: 'Phí tư vấn ban đầu là bao nhiêu?', answer: 'Phí tư vấn từ 500.000đ/buổi, tùy mức độ phức tạp.' },
          ],
        },
      };
    case 'news':
      return { id, type, order: 0, props: { limit: 3, layout: 'grid' } };
    case 'lawyers':
      return { id, type, order: 0, props: { limit: 4, showSchedule: true } };
    case 'map':
      return {
        id,
        type,
        order: 0,
        props: {
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5!2d106.7!3d10.78!',
          height: 400,
        },
      };
    case 'contact':
      return {
        id,
        type,
        order: 0,
        props: {
          address: 'Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM',
          phone: '028 1234 5678',
          email: 'contact@vpluat.vn',
          workingHours: 'T2 - T7: 8:00 - 17:30',
          showMap: true,
        },
      };
  }
}

export const BLOCK_DEFINITIONS: Array<{
  type: LandingBlockType;
  label: string;
  description: string;
  icon: string;
  category: 'hero' | 'content' | 'conversion' | 'social' | 'info';
}> = [
  { type: 'hero', label: 'Hero', description: 'Banner lớn đầu page', icon: '🎯', category: 'hero' },
  { type: 'text', label: 'Text', description: 'Khối text thường', icon: '📝', category: 'content' },
  { type: 'image', label: 'Image', description: 'Ảnh đơn', icon: '🖼', category: 'content' },
  { type: 'cta', label: 'CTA', description: 'Call-to-action', icon: '🔘', category: 'conversion' },
  { type: 'lead-form', label: 'Lead Form', description: 'Form nhận lead', icon: '📞', category: 'conversion' },
  { type: 'testimonials', label: 'Testimonials', description: 'Carousel reviews', icon: '💬', category: 'social' },
  { type: 'pricing', label: 'Pricing', description: 'Bảng giá dịch vụ', icon: '💲', category: 'content' },
  { type: 'reviews', label: 'Reviews', description: 'Hiển thị reviews', icon: '⭐', category: 'social' },
  { type: 'faq', label: 'FAQ', description: 'Accordion FAQ', icon: '❓', category: 'info' },
  { type: 'news', label: 'News', description: 'Tin tức mới nhất', icon: '📰', category: 'content' },
  { type: 'lawyers', label: 'Lawyers', description: 'Grid luật sư', icon: '👨‍⚖️', category: 'social' },
  { type: 'map', label: 'Map', description: 'Google Maps', icon: '🗺', category: 'info' },
  { type: 'contact', label: 'Contact', description: 'Thông tin liên hệ', icon: '📍', category: 'info' },
];

export const STATUS_LABELS: Record<LandingPageStatus, string> = {
  draft: 'Nháp',
  published: 'Live',
  archived: 'Lưu trữ',
};

export const AUDIENCE_LABELS: Record<NonNullable<LandingPage['targetAudience']>, string> = {
  fdi: 'FDI / Đầu tư',
  enterprise: 'Doanh nghiệp',
  individual: 'Cá nhân',
  startup: 'Startup',
  all: 'Tất cả',
};
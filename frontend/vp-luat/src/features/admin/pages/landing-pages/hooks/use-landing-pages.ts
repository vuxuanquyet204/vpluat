'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useApiQuery,
  useApiMutation,
} from '@/lib/api/hooks';
import { landingPageApi, type LandingPage } from '@/lib/api/admin-content';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

/**
 * Adapter from the backend LandingPageDTO to the legacy UI shape so
 * existing landing-page components keep rendering unchanged.
 */
function adapt(p: LandingPage): LandingPage {
  const parsed = parseBlocks(p);
  return {
    ...p,
    title: p.titleVi ?? p.titleEn ?? p.slug,
    blocks: parsed,
  };
}

/**
 * Try to extract the `blocks` array from the landing page's
 * `content` JSON envelope. Falls back to an empty array so the UI
 * always has a stable list to render.
 */
function parseBlocks(p: LandingPage): unknown[] {
  if (Array.isArray((p as { blocks?: unknown[] }).blocks)) {
    return (p as { blocks: unknown[] }).blocks;
  }
  if (!p.content) return [];
  try {
    const obj = JSON.parse(p.content);
    if (Array.isArray(obj?.blocks)) return obj.blocks;
  } catch {
    // fall through
  }
  return [];
}

export function useLandingPages() {
  const { data, isLoading, error, refetch } = useApiQuery<{ content: LandingPage[]; totalElements: number }>(
    ['admin', 'landing-pages'],
    '/admin/landing-pages',
    { page: 0, size: 200 },
  );
  const list = (data?.content ?? []).map(adapt);
  const counts = useMemo(() => {
    const c = { total: list.length, published: 0, draft: 0, archived: 0, variants: 0 };
    for (const p of list) {
      if (p.isPublished) c.published += 1;
      else c.draft += 1;
      if (p.title?.includes('Variant')) c.variants += 1;
    }
    return c;
  }, [list]);
  return { data: list, counts, isLoading, error, refetch };
}

export function useLandingPage(id: string | null) {
  const { data, isLoading } = useApiQuery<LandingPage>(
    ['admin', 'landing-page', id ?? ''],
    `/admin/landing-pages/${id ?? ''}`,
    {},
    { enabled: Boolean(id), retry: false },
  );
  return { data: data ? adapt(data) : undefined, isLoading };
}

export function useCreateLandingPage() {
  const qc = useQueryClient();
  const mutation = useApiMutation<LandingPage, { titleVi: string; titleEn?: string; slug: string; content: string }>(
    'POST',
    '/admin/landing-pages',
  );
  return useCallback(
    async (values: { title: string; slug: string; description?: string }) => {
      try {
        const created = await mutation.mutateAsync({
          titleVi: values.title,
          slug: values.slug,
          content: values.description ?? '',
        });
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({
          action: 'create',
          entity: 'landing_page',
          entityId: created.id,
          entityLabel: created.titleVi ?? created.slug,
        });
        notifySuccess('Đã tạo landing page');
        return created.id;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo');
        return null;
      }
    },
    [mutation, qc],
  );
}

export function useUpdateLandingPage() {
  const qc = useQueryClient();
  const mutation = useApiMutation<LandingPage, { id: string; values: Partial<LandingPage> }>(
    'PATCH',
    (vars) => `/admin/landing-pages/${vars.id}`,
  );
  return useCallback(
    async (id: string, patch: Partial<LandingPage>) => {
      try {
        const updated = await mutation.mutateAsync({ id, values: patch });
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({
          action: 'update',
          entity: 'landing_page',
          entityId: id,
          entityLabel: updated.titleVi ?? updated.slug,
        });
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useDeleteLandingPage() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id) => `/admin/landing-pages/${id}`,
  );
  return useCallback(
    async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({ action: 'delete', entity: 'landing_page', entityId: id });
        notifySuccess('Đã xóa landing page');
        return true;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
        return false;
      }
    },
    [mutation, qc],
  );
}

export function usePublishLandingPage() {
  const qc = useQueryClient();
  return useCallback(
    async (id: string) => {
      try {
        await landingPageApi.publish(id);
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({
          action: 'publish',
          entity: 'landing_page',
          entityId: id,
          diff: { before: { isPublished: false }, after: { isPublished: true } },
        });
        notifySuccess('Đã publish');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể publish');
      }
    },
    [qc],
  );
}

export function useUnpublishLandingPage() {
  const qc = useQueryClient();
  return useCallback(
    async (id: string) => {
      try {
        await landingPageApi.unpublish(id);
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({
          action: 'update',
          entity: 'landing_page',
          entityId: id,
          diff: { before: { isPublished: true }, after: { isPublished: false } },
        });
        notifySuccess('Đã chuyển về nháp');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể chuyển nháp');
      }
    },
    [qc],
  );
}

/** Persist the block layout to the backend. */
export function useUpdateLandingBlocks() {
  const qc = useQueryClient();
  const mutation = useApiMutation<LandingPage, { id: string; blocks: string }>(
    'PUT',
    (vars) => `/admin/landing-pages/${vars.id}/blocks`,
  );
  return useCallback(
    async (id: string, blocks: unknown[]) => {
      try {
        await mutation.mutateAsync({ id, blocks: JSON.stringify(blocks) });
        qc.invalidateQueries({ queryKey: ['admin', 'landing-pages'] });
        ghiAudit({
          action: 'update',
          entity: 'landing_page',
          entityId: id,
          entityLabel: `${blocks.length} blocks`,
        });
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu blocks');
      }
    },
    [mutation, qc],
  );
}

/** Server-side duplicate isn't exposed, so we mimic it by creating a
 *  fresh landing page titled "(bản sao)" based on the source's slug. */
export function useDuplicateLandingPage() {
  const create = useCreateLandingPage();
  return useCallback(
    async (id: string) => {
      return create({
        title: `Copy of ${id}`,
        slug: `${id}-copy-${Date.now()}`,
        description: 'Landing page duplicated từ bản gốc',
      });
    },
    [create],
  );
}

export function useCreateVariant() {
  const create = useCreateLandingPage();
  const qc = useQueryClient();
  return useCallback(
    async (parentId: string) => {
      void qc;
      return create({ title: `Variant of ${parentId}`, slug: `${parentId}-b-${Date.now()}` });
    },
    [create, qc],
  );
}

export function useCreateLandingFromTemplate() {
  return useCreateLandingPage();
}

// ─── Client-side helpers (unchanged, no API involvement) ─────

export type { LandingBlock, LandingBlockType, LandingPageStatus } from '@/features/admin/types';

// Re-import for backwards-compat with the rest of the file:
import type { LandingBlock, LandingBlockType, LandingPageStatus } from '@/features/admin/types';

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

export const AUDIENCE_LABELS = {
  fdi: 'FDI / Đầu tư',
  enterprise: 'Doanh nghiệp',
  individual: 'Cá nhân',
  startup: 'Startup',
  all: 'Tất cả',
} as const;
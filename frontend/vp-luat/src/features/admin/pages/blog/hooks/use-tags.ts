'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { tagApi, type Tag } from '@/lib/api/admin-content';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';

/** Fetch all tags. */
export function useTags() {
  const { data } = useApiQuery<Tag[]>(
    ['admin', 'tags'],
    '/admin/tags',
    {},
    { retry: false },
  );
  return data ?? [];
}

export function useCreateTag() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Tag, { slug: string; name?: string }>(
    'POST',
    '/admin/tags',
  );

  return useCallback(
    async (data: { name: string; slug: string }) => {
      try {
        const created = await mutation.mutateAsync({ slug: data.slug, name: data.name });
        qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
        ghiAudit({ action: 'create', entity: 'tag', entityId: created.slug, entityLabel: created.name ?? created.slug });
        notifySuccess('Đã tạo tag');
        return created;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo tag');
        throw e;
      }
    },
    [mutation, qc],
  );
}

/** Update the display name of an existing tag. */
export function useUpdateTag() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Tag, { slug: string; name?: string }>(
    'PUT',
    (vars) => `/admin/tags/${vars.slug}`,
  );
  return useCallback(
    async (vars: { id: string; patch: { name?: string; slug?: string } }) => {
      try {
        const updated = await mutation.mutateAsync({
          slug: vars.id,
          name: vars.patch.name,
        });
        qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
        ghiAudit({
          action: 'update',
          entity: 'tag',
          entityId: vars.id,
          entityLabel: updated.name ?? updated.slug,
        });
        notifySuccess('Đã cập nhật tag');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        return null;
      }
    },
    [mutation, qc],
  );
}

export function useDeleteTag() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, string>(
    'DELETE',
    (slug) => `/admin/tags/${slug}`,
  );

  return useCallback(
    async (slug: string) => {
      try {
        await mutation.mutateAsync(slug);
        qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
        ghiAudit({ action: 'delete', entity: 'tag', entityId: slug });
        notifySuccess('Đã xóa tag');
        return true;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
        return false;
      }
    },
    [mutation, qc],
  );
}
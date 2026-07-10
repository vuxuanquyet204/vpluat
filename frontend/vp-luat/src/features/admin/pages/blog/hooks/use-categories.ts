'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { categoryApi, type Category, type CategoryCreateRequest } from '@/lib/api/admin-content';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';

/** Fetch all categories (admin scope). */
export function useCategories() {
  const { data } = useApiQuery<Category[]>(
    ['admin', 'categories'],
    '/admin/categories',
    {},
    { retry: false },
  );
  return data ?? [];
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Category, CategoryCreateRequest>(
    'POST',
    '/admin/categories',
  );

  return useCallback(
    async (data: { name: string; slug: string; description?: string; parentId?: string }) => {
      try {
        const created = await mutation.mutateAsync({
          slug: data.slug,
          parentId: data.parentId,
          metaTitleVi: data.name,
          metaDescVi: data.description,
        });
        qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
        ghiAudit({
          action: 'create',
          entity: 'category',
          entityId: created.id,
          entityLabel: created.metaTitleVi ?? created.slug,
        });
        notifySuccess('Đã tạo danh mục');
        return created;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Category, { id: string; values: Partial<CategoryCreateRequest> }>(
    'PUT',
    (vars) => `/admin/categories/${vars.id}`,
  );

  return useCallback(
    async (vars: { id: string; patch: Partial<CategoryCreateRequest> }) => {
      try {
        const updated = await mutation.mutateAsync({ id: vars.id, values: vars.patch });
        qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
        ghiAudit({
          action: 'update',
          entity: 'category',
          entityId: vars.id,
          entityLabel: updated.metaTitleVi ?? updated.slug,
        });
        notifySuccess('Đã cập nhật danh mục');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id) => `/admin/categories/${id}`,
  );

  return useCallback(
    async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
        ghiAudit({ action: 'delete', entity: 'category', entityId: id });
        notifySuccess('Đã xóa danh mục');
        return true;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
        return false;
      }
    },
    [mutation, qc],
  );
}
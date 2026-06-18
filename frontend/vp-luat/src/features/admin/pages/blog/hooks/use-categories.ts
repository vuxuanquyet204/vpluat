'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDB } from '../../../mock/db';
import { ghiAudit, notifySuccess } from '../../../lib';
import type { Category } from '../../../types';

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Category, 'id' | 'createdAt' | 'postCount'>) => {
      const created = MockDB.insert<Category>('categories', { ...data, postCount: 0 } as Category);
      ghiAudit({ action: 'create', entity: 'category', entityId: created.id, entityLabel: created.name });
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifySuccess('Đã tạo danh mục');
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Category> }) => {
      const updated = MockDB.update<Category>('categories', vars.id, vars.patch);
      ghiAudit({ action: 'update', entity: 'category', entityId: vars.id, entityLabel: updated?.name });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifySuccess('Đã cập nhật danh mục');
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById<Category>('categories', id);
      const ok = MockDB.delete('categories', id);
      if (ok) ghiAudit({ action: 'delete', entity: 'category', entityId: id, entityLabel: before?.name });
      return ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      notifySuccess('Đã xóa danh mục');
    },
  });
}

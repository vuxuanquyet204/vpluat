'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDB } from '../../../mock/db';
import { ghiAudit, notifySuccess } from '../../../lib';
import type { Tag } from '../../../types';

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Tag, 'id' | 'postCount'>) => {
      const created = MockDB.insert<Tag>('tags', { ...data, postCount: 0 } as Tag);
      ghiAudit({ action: 'create', entity: 'tag', entityId: created.id, entityLabel: created.name });
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      notifySuccess('Đã tạo tag');
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<Tag> }) => {
      const updated = MockDB.update<Tag>('tags', vars.id, vars.patch);
      ghiAudit({ action: 'update', entity: 'tag', entityId: vars.id, entityLabel: updated?.name });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      notifySuccess('Đã cập nhật tag');
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById<Tag>('tags', id);
      const ok = MockDB.delete('tags', id);
      if (ok) ghiAudit({ action: 'delete', entity: 'tag', entityId: id, entityLabel: before?.name });
      return ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] });
      notifySuccess('Đã xóa tag');
    },
  });
}

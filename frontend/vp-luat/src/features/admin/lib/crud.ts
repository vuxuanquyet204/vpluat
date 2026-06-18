/**
 * Generic CRUD hooks cho MockDB.
 * Mỗi hook tự gọi TanStack Query để invalidate cache sau mutation.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDB, type CollectionName } from '../mock/db';
import { ghiAudit } from './audit';

type AnyRecord = Record<string, unknown>;

function labelOf(record: AnyRecord | null | undefined): string | undefined {
  if (!record) return undefined;
  const name = record.name ?? record.title;
  return typeof name === 'string' ? name : undefined;
}

export function useCreate<T extends object>(collection: CollectionName, entityName?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = MockDB.insert<T>(collection, data as T);
      ghiAudit({
        action: 'create',
        entity: entityName ?? collection,
        entityId: (created as AnyRecord).id as string,
        entityLabel: labelOf(created as AnyRecord),
      });
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collection] }),
  });
}

export function useUpdate<T extends object>(collection: CollectionName, entityName?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<T> }) => {
      const updated = MockDB.update<T>(collection, vars.id, vars.patch);
      ghiAudit({
        action: 'update',
        entity: entityName ?? collection,
        entityId: vars.id,
        entityLabel: labelOf(updated as AnyRecord),
      });
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collection] }),
  });
}

export function useDelete(collection: CollectionName, entityName?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById(collection, id);
      const ok = MockDB.delete(collection, id);
      if (ok)
        ghiAudit({
          action: 'delete',
          entity: entityName ?? collection,
          entityId: id,
          entityLabel: labelOf(before as AnyRecord),
        });
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collection] }),
  });
}

export function useDeleteMany(collection: CollectionName, entityName?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const removed = MockDB.deleteMany(collection, ids);
      ghiAudit({
        action: 'delete',
        entity: entityName ?? collection,
        entityId: ids.join(','),
        entityLabel: `${ids.length} records`,
      });
      return removed;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', collection] }),
  });
}

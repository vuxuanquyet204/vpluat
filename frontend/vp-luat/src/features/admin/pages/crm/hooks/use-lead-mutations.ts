'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/hooks';
import { leadApi } from '@/lib/api';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  const mutation = useApiMutation<unknown, { id: string; status: string }>(
    'PATCH',
    (vars) => `/crm/leads/${vars.id}`,
  );

  return useCallback(
    async (id: string, status: string, previousStatus?: string) => {
      try {
        await mutation.mutateAsync({ id, status });
        qc.invalidateQueries({ queryKey: ['crm', 'leads'] });
        ghiAudit({
          action: 'status_change',
          entity: 'lead',
          entityId: id,
          diff: {
            before: { status: previousStatus },
            after: { status },
          },
        });
        notifySuccess('Đã cập nhật trạng thái lead');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useAssignLead() {
  const qc = useQueryClient();
  return useCallback(
    async (id: string, assigneeId: string) => {
      try {
        await leadApi.assign(id, assigneeId);
        qc.invalidateQueries({ queryKey: ['crm', 'leads'] });
        notifySuccess('Đã gán lead');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gán lead');
      }
    },
    [qc],
  );
}

export function useAddLeadNote() {
  const qc = useQueryClient();
  return useCallback(
    async (id: string, note: string) => {
      try {
        await leadApi.addNote(id, note);
        qc.invalidateQueries({ queryKey: ['crm', 'leads'] });
        qc.invalidateQueries({ queryKey: ['crm', 'lead-timeline', id] });
        notifySuccess('Đã thêm ghi chú');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể thêm ghi chú');
      }
    },
    [qc],
  );
}

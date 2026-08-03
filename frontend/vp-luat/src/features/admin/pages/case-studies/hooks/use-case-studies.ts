'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import { caseStudyApi, type CaseStudy, type CaseStudyRequest } from '@/lib/api/admin-case-study';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

// Backend trả về services: List<ServiceEntity> với fields { id, name }
// FE cần serviceIds và serviceNames - cần map ở đây
interface BackendCaseStudy extends CaseStudy {
  services?: Array<{ id: string; name: string }>;
}

function mapCaseStudy(raw: BackendCaseStudy): CaseStudy {
  return {
    ...raw,
    serviceIds: raw.services?.map((s) => s.id) ?? [],
    serviceNames: raw.services?.map((s) => s.name) ?? [],
  };
}

export function useCaseStudies(publishedOnly = false) {
  const { data: rawData = [], isLoading, error } = useApiQuery<BackendCaseStudy[]>(
    ['admin', 'case-studies', { publishedOnly }],
    '/admin/case-studies',
    { publishedOnly },
  );
  const data = rawData.map(mapCaseStudy);
  return { data, isLoading, error };
}

export function useCaseStudy(id: string | null | undefined) {
  const { data: rawData, isLoading, error } = useApiQuery<BackendCaseStudy>(
    ['admin', 'case-studies', id],
    id ? `/admin/case-studies/${id}` : '/admin/case-studies',
    undefined,
    { enabled: Boolean(id) },
  );
  return { data: rawData ? mapCaseStudy(rawData) : undefined, isLoading, error };
}

export function useCreateCaseStudy() {
  const qc = useQueryClient();
  const mutation = useApiMutation<CaseStudy, CaseStudyRequest>(
    'POST',
    '/admin/case-studies',
  );

  const trigger = useCallback(
    async (data: CaseStudyRequest) => {
      try {
        const created = await mutation.mutateAsync(data);
        qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] });
        ghiAudit({
          action: 'create',
          entity: 'case_study',
          entityId: created.id,
          entityLabel: created.titleVi ?? created.slug,
        });
        notifySuccess('Đã tạo case study');
        return created;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo');
        throw e;
      }
    },
    [mutation, qc],
  );

  return Object.assign(trigger, { isPending: mutation.isPending });
}

export function useUpdateCaseStudy() {
  const qc = useQueryClient();
  const mutation = useApiMutation<CaseStudy, { id: string; patch: Partial<CaseStudyRequest> }>(
    'PUT',
    (vars) => `/admin/case-studies/${vars.id}`,
  );

  const trigger = useCallback(
    async (vars: { id: string; patch: Partial<CaseStudyRequest> }) => {
      try {
        const updated = await mutation.mutateAsync({ id: vars.id, patch: vars.patch });
        qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] });
        ghiAudit({
          action: 'update',
          entity: 'case_study',
          entityId: vars.id,
          entityLabel: updated.titleVi ?? updated.slug,
        });
        notifySuccess('Đã cập nhật case study');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        throw e;
      }
    },
    [mutation, qc],
  );

  return Object.assign(trigger, { isPending: mutation.isPending });
}

export function usePublishCaseStudy() {
  const qc = useQueryClient();
  const mutation = useApiMutation<CaseStudy, string>('PATCH', (id) => `/admin/case-studies/${id}/publish`);

  const trigger = useCallback(
    async (id: string) => {
      try {
        const updated = await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] });
        ghiAudit({
          action: 'publish',
          entity: 'case_study',
          entityId: id,
          entityLabel: updated.titleVi ?? updated.slug,
        });
        notifySuccess('Đã xuất bản case study');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xuất bản');
        throw e;
      }
    },
    [mutation, qc],
  );

  return Object.assign(trigger, { isPending: mutation.isPending });
}

export function useUnpublishCaseStudy() {
  const qc = useQueryClient();
  const mutation = useApiMutation<CaseStudy, string>('PATCH', (id) => `/admin/case-studies/${id}/unpublish`);

  const trigger = useCallback(
    async (id: string) => {
      try {
        const updated = await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] });
        ghiAudit({
          action: 'update',
          entity: 'case_study',
          entityId: id,
          entityLabel: updated.titleVi ?? updated.slug,
        });
        notifySuccess('Đã hủy xuất bản case study');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể hủy xuất bản');
        throw e;
      }
    },
    [mutation, qc],
  );

  return Object.assign(trigger, { isPending: mutation.isPending });
}

export function useDeleteCaseStudy() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, string>('DELETE', (id) => `/admin/case-studies/${id}`);

  const trigger = useCallback(
    async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'case-studies'] });
        ghiAudit({
          action: 'delete',
          entity: 'case_study',
          entityId: id,
          entityLabel: 'case study',
        });
        notifySuccess('Đã xóa case study');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
        throw e;
      }
    },
    [mutation, qc],
  );

  return Object.assign(trigger, { isPending: mutation.isPending });
}

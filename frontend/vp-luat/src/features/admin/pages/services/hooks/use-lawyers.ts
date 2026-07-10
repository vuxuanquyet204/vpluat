'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

// Re-export Service type so components can import from one place
export type { Service } from './use-services';
export type { Lawyer } from './use-services';

import type { Service, Lawyer } from './use-services';

// ─── Mappers from raw API shape to page-expected shape ──────────────────────

function mapToLawyer(raw: Record<string, unknown>): Lawyer {
  const arr = Array.isArray(raw.specializations) ? raw.specializations : [];
  return {
    id: String(raw.id ?? ''),
    name: String(raw.fullName ?? ''),
    title: '',
    bio: String(raw.bio ?? ''),
    avatar: raw.avatarUrl as string | undefined,
    specialties: arr as string[],
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    experience: Number(raw.experienceYears ?? 0),
    serviceIds: Array.isArray(raw.serviceIds) ? (raw.serviceIds as string[]) : [],
    isActive: Boolean(raw.isActive ?? true),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

// ─── Query hooks ───────────────────────────────────────────────────────────────

export function useLawyers() {
  const { data = [], ...rest } = useApiQuery<Lawyer[]>(
    ['lawyers'],
    '/admin/lawyers',
    undefined,
  );

  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, inactive: 0 };
    for (const l of data) {
      if (l.isActive) c.active += 1;
      else c.inactive += 1;
    }
    return c;
  }, [data]);

  return { data, counts, ...rest };
}

export function useLawyer(id: string | null | undefined) {
  const { data } = useApiQuery<Lawyer>(
    ['lawyers'],
    id ? `/admin/lawyers/${id}` : '/admin/lawyers',
    undefined,
    { enabled: Boolean(id) },
  );
  return data ?? null;
}

export function useLawyerServices(lawyerId: string | null | undefined) {
  const { data: services = [] } = useApiQuery<Service[]>(
    ['services'],
    '/admin/services',
    undefined,
  );
  if (!lawyerId) return [];
  return services.filter((s) => s.lawyerIds?.includes(lawyerId));
}

export function useActiveLawyers() {
  const { data: lawyers = [] } = useApiQuery<Lawyer[]>(
    ['lawyers'],
    '/admin/lawyers',
    undefined,
  );
  return useMemo(() => lawyers.filter((l) => l.isActive), [lawyers]);
}

// ─── CRUD mutations ────────────────────────────────────────────────────────────

export function useCreateLawyer() {
  const qc = useQueryClient();

  const mutation = useApiMutation<Record<string, unknown>, Omit<Lawyer, 'id'>>(
    'POST',
    '/admin/lawyers',
    {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: ['lawyers'] });
        const mapped = mapToLawyer(data);
        ghiAudit({
          action: 'create',
          entity: 'lawyer',
          entityId: mapped.id,
          entityLabel: mapped.name,
        });
        notifySuccess('Đã tạo luật sư');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo luật sư');
      },
    },
  );

  return useCallback(
    (body: Omit<Lawyer, 'id'>) => mutation.mutate(body),
    [mutation],
  );
}

export function useUpdateLawyer() {
  const qc = useQueryClient();

  const mutation = useApiMutation<Record<string, unknown>, { id: string; body: Partial<Omit<Lawyer, 'id'>> }>(
    'PATCH',
    (vars) => `/admin/lawyers/${vars.id}`,
    {
      onSuccess: (data, vars) => {
        qc.invalidateQueries({ queryKey: ['lawyers'] });
        const mapped = mapToLawyer(data);
        ghiAudit({
          action: 'update',
          entity: 'lawyer',
          entityId: vars.id,
          entityLabel: mapped.name,
        });
        notifySuccess('Đã cập nhật luật sư');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật luật sư');
      },
    },
  );

  return useCallback(
    (id: string, body: Partial<Omit<Lawyer, 'id'>>) => mutation.mutate({ id, body }),
    [mutation],
  );
}

export function useDeleteLawyer() {
  const qc = useQueryClient();

  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id: string) => `/admin/lawyers/${id}`,
    {
      onSuccess: (_, id) => {
        qc.invalidateQueries({ queryKey: ['lawyers'] });
        ghiAudit({
          action: 'delete',
          entity: 'lawyer',
          entityId: id,
          entityLabel: 'lawyer',
        });
        notifySuccess('Đã xóa luật sư');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa luật sư');
      },
    },
  );

  return useCallback(
    (id: string) => mutation.mutate(id),
    [mutation],
  );
}

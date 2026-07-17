'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

// Re-export Service type so components can import from one place
export type { Service } from './use-services';
export type { Lawyer } from './use-services';

import type { Service, Lawyer } from './use-services';
import { mapToLawyer } from './use-services';

// ─── Query hooks ───────────────────────────────────────────────────────────────

export function useLawyers() {
  const { data: rawData = [], ...rest } = useApiQuery<Lawyer[]>(
    ['lawyers'],
    '/admin/lawyers',
    undefined,
  );

  const data = useMemo(() => {
    return (rawData as unknown as Record<string, unknown>[]).map(mapToLawyer);
  }, [rawData]);

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

  const mutation = useApiMutation<Record<string, unknown>, Record<string, unknown>>(
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
        // Nếu BE tự tạo user mới với password mặc định → nhắc admin
        const defaultPwd = (data as { defaultPassword?: string }).defaultPassword;
        if (defaultPwd) {
          notifySuccess(
            `Tài khoản đăng nhập tạm thời mật khẩu: ${defaultPwd}`,
          );
        }
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo luật sư');
      },
    },
  );

  return Object.assign(
    (body: Record<string, unknown>) => {
      // body đã là payload đã mapped từ index.tsx - không cần map lại
      return new Promise<Record<string, unknown>>((resolve, reject) => {
        mutation.mutate(body, {
          onSuccess: (data) => resolve(data),
          onError: (err) => reject(err),
        });
      });
    },
    { isPending: mutation.isPending },
  );
}

export function useUpdateLawyer() {
  const qc = useQueryClient();

  // Dùng PATCH để update partial - tránh mất field khi FE không gửi đầy đủ
  // body đã là payload đã mapped từ index.tsx (có nameVi, nameEn, positionVi,...)
  const mutation = useApiMutation<Record<string, unknown>, { id: string; body: Record<string, unknown> }>(
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

  return Object.assign(
    useCallback(
      (id: string, body: Record<string, unknown>) => {
        // body đã là payload đã mapped - gửi trực tiếp
        mutation.mutate({ id, body });
      },
      [mutation],
    ),
    { isPending: mutation.isPending },
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

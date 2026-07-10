'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

// ─── Types matching what pages/components expect ──────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  duration?: number;
  category: string;
  isActive: boolean;
  lawyerIds: string[];
  createdAt: string;
}

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  specialties: string[];
  email: string;
  phone: string;
  experience: number;
  serviceIds: string[];
  isActive: boolean;
  createdAt: string;
}

// ─── Mappers from raw API shape to page-expected shape ──────────────────────

function mapToService(raw: Record<string, unknown>): Service {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    price: raw.price as number | undefined,
    duration: raw.duration as number | undefined,
    category: String(raw.category ?? ''),
    isActive: Boolean(raw.isActive ?? true),
    lawyerIds: (Array.isArray(raw.lawyerIds) ? raw.lawyerIds : []) as string[],
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

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

export function useServices() {
  const { data = [], ...rest } = useApiQuery<Service[]>(
    ['services'],
    '/admin/services',
    undefined,
  );

  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, inactive: 0 };
    for (const s of data) {
      if (s.isActive) c.active += 1;
      else c.inactive += 1;
    }
    return c;
  }, [data]);

  return { data, counts, ...rest };
}

export function useService(id: string | null | undefined) {
  const { data } = useApiQuery<Service>(
    ['services'],
    id ? `/admin/services/${id}` : '/admin/services',
    undefined,
    { enabled: Boolean(id) },
  );
  return data ?? null;
}

export function useServiceLawyers(serviceId: string | null | undefined) {
  const { data: lawyers = [] } = useApiQuery<Lawyer[]>(
    ['lawyers'],
    '/admin/lawyers',
    undefined,
  );
  if (!serviceId) return [];
  return lawyers.filter((l) => l.serviceIds?.includes(serviceId));
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const SERVICE_CATEGORIES = [
  'Doanh nghiệp',
  'Pháp luật',
  'Nhà đất',
  'Sở hữu trí tuệ',
  'Gia đình',
  'Hợp đồng',
  'Thương mại',
  'Lao động',
  'Hình sự',
  'Hành chính',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// ─── CRUD mutations ────────────────────────────────────────────────────────────

export function useCreateService() {
  const qc = useQueryClient();

  const mutation = useApiMutation<Record<string, unknown>, Omit<Service, 'id'>>(
    'POST',
    '/admin/services',
    {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: ['services'] });
        const mapped = mapToService(data);
        ghiAudit({
          action: 'create',
          entity: 'service',
          entityId: mapped.id,
          entityLabel: mapped.name,
        });
        notifySuccess('Đã tạo dịch vụ');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo dịch vụ');
      },
    },
  );

  return useCallback(
    (body: Omit<Service, 'id'>) => mutation.mutate(body),
    [mutation],
  );
}

export function useUpdateService() {
  const qc = useQueryClient();

  const mutation = useApiMutation<Record<string, unknown>, { id: string; body: Partial<Omit<Service, 'id'>> }>(
    'PUT',
    (vars) => `/admin/services/${vars.id}`,
    {
      onSuccess: (data, vars) => {
        qc.invalidateQueries({ queryKey: ['services'] });
        const mapped = mapToService(data);
        ghiAudit({
          action: 'update',
          entity: 'service',
          entityId: vars.id,
          entityLabel: mapped.name,
        });
        notifySuccess('Đã cập nhật dịch vụ');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật dịch vụ');
      },
    },
  );

  return useCallback(
    (id: string, body: Partial<Omit<Service, 'id'>>) => mutation.mutate({ id, body }),
    [mutation],
  );
}

export function useDeleteService() {
  const qc = useQueryClient();

  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id: string) => `/admin/services/${id}`,
    {
      onSuccess: (_, id) => {
        qc.invalidateQueries({ queryKey: ['services'] });
        ghiAudit({
          action: 'delete',
          entity: 'service',
          entityId: id,
          entityLabel: 'service',
        });
        notifySuccess('Đã xóa dịch vụ');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa dịch vụ');
      },
    },
  );

  return useCallback(
    (id: string) => mutation.mutate(id),
    [mutation],
  );
}

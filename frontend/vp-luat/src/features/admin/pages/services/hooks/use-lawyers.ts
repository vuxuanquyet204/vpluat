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
  const arr = Array.isArray(raw.languages) ? raw.languages : [];
  const email = (raw.userEmail as string | null) || '';
  const phone = (raw.phone as string | null) || '';
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    userId: raw.userId ? String(raw.userId) : undefined,
    userEmail: raw.userEmail ? String(raw.userEmail) : undefined,
    name: String(raw.nameVi ?? raw.nameEn ?? ''),
    nameVi: raw.nameVi ? String(raw.nameVi) : undefined,
    nameEn: raw.nameEn ? String(raw.nameEn) : undefined,
    title: String(raw.positionVi ?? raw.positionEn ?? ''),
    positionVi: raw.positionVi ? String(raw.positionVi) : undefined,
    positionEn: raw.positionEn ? String(raw.positionEn) : undefined,
    bio: String(raw.bioVi ?? raw.bioEn ?? ''),
    bioVi: raw.bioVi ? String(raw.bioVi) : undefined,
    bioEn: raw.bioEn ? String(raw.bioEn) : undefined,
    avatar: (raw.avatarUrl as string | null) ?? undefined,
    specialties: arr as string[],
    barNumber: raw.barNumber ? String(raw.barNumber) : undefined,
    email,
    phone,
    experience: Number(raw.experienceYears ?? 0),
    serviceIds: Array.isArray(raw.serviceIds) ? (raw.serviceIds as string[]) : [],
    workingHours: (raw.workingHours as Record<string, unknown>) ?? undefined,
    isActive: Boolean(raw.isFeatured ?? true),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

// ─── Mapper from FE form to BE request ──────────────────────────────────────

interface LawyerFormData {
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
}

function mapToBackendRequest(form: Partial<LawyerFormData>): Record<string, unknown> {
  const name = (form.name ?? '').toString().trim();
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50) || `lawyer-${Date.now()}`;

  return {
    slug,
    nameVi: name,
    nameEn: name,
    bioVi: form.bio ?? '',
    bioEn: form.bio ?? '',
    positionVi: form.title ?? '',
    positionEn: form.title ?? '',
    experienceYears: form.experience ?? 0,
    languages: form.specialties ?? [],
    avatarUrl: form.avatar || null,
    serviceIds: form.serviceIds ?? [],
    isFeatured: form.isActive ?? true,
    email: form.email || null,
    phone: form.phone || null,
  };
}

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

  const mutation = useApiMutation<Record<string, unknown>, LawyerFormData>(
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

  return Object.assign(
    useCallback(
      (body: LawyerFormData) => mutation.mutate(mapToBackendRequest(body) as unknown as LawyerFormData),
      [mutation],
    ),
    { isPending: mutation.isPending },
  );
}

export function useUpdateLawyer() {
  const qc = useQueryClient();

  // Dùng PATCH để update partial - tránh mất field khi FE không gửi đầy đủ
  const mutation = useApiMutation<Record<string, unknown>, { id: string; body: Partial<LawyerFormData> | Record<string, unknown> }>(
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
      (id: string, body: Partial<LawyerFormData> | Record<string, unknown>) => {
        const finalBody =
          'nameVi' in (body as Record<string, unknown>) ||
          'nameEn' in (body as Record<string, unknown>) ||
          'positionVi' in (body as Record<string, unknown>)
            ? body
            : mapToBackendRequest(body as Partial<LawyerFormData>);
        mutation.mutate({ id, body: finalBody });
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

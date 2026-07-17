'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

// ─── Types matching backend ServiceDTO ───────────────────────────
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

// ─── Types matching backend LawyerDTO ─────────────────────────────
export interface Lawyer {
  id: string;
  slug: string;
  userId?: string;
  userEmail?: string;
  name: string;
  nameVi?: string;
  nameEn?: string;
  title: string;
  positionVi?: string;
  positionEn?: string;
  bio: string;
  bioVi?: string;
  bioEn?: string;
  avatar?: string;
  specialties: string[];
  barNumber?: string;
  email: string;
  phone: string;
  experience: number;
  serviceIds: string[];
  workingHours?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  createdByName?: string;
}

// ─── Backend response shape ─────────────────────────────────────
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Mappers from raw API shape to page-expected shape ──────────

function mapToService(raw: Record<string, unknown>): Service {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.title ?? raw.slug ?? ''),
    description: String(raw.excerpt ?? raw.content ?? ''),
    price: raw.price as number | undefined,
    duration: raw.duration as number | undefined,
    category: String(raw.parentName ?? ''),
    isActive: Boolean(raw.isActive ?? true),
    lawyerIds: (Array.isArray(raw.lawyerIds) ? raw.lawyerIds : []) as string[],
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function mapToLawyer(raw: Record<string, unknown>): Lawyer {
  const arr = Array.isArray(raw.languages) ? raw.languages : [];
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
    email: String(raw.userEmail ?? ''),
    phone: String(raw.phone ?? ''),
    experience: Number(raw.experienceYears ?? 0),
    serviceIds: Array.isArray(raw.serviceIds) ? (raw.serviceIds as string[]) : [],
    workingHours: (raw.workingHours as Record<string, unknown>) ?? undefined,
    // BE uses isFeatured to mean "is active" — true = Hoạt động, false = Tạm dừng
    isActive: raw.isFeatured !== false,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    createdByName: (raw.createdByName as string | null) ?? undefined,
  };
}

// ─── Query hooks ─────────────────────────────────────────────────

export function useServices() {
  const { data, ...rest } = useApiQuery<PageResponse<Record<string, unknown>>>(
    ['services'],
    '/admin/services',
    { page: 0, size: 200 },
  );

  const services = useMemo(() => {
    return (data?.content ?? []).map(mapToService);
  }, [data?.content]);

  const counts = useMemo(() => {
    const c = { total: services.length, active: 0, inactive: 0 };
    for (const s of services) {
      if (s.isActive) c.active += 1;
      else c.inactive += 1;
    }
    return c;
  }, [services]);

  return { data: services, counts, ...rest };
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

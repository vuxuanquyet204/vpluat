'use client';

import { useMemo } from 'react';
import { useMockQuery } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Service, Lawyer } from '@/features/admin/types';

export function useServices() {
  const { data = [], ...rest } = useMockQuery<Service>('services', undefined, {
    by: 'name',
    dir: 'asc',
  });
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
  const service = id ? MockDB.getById<Service>('services', id) ?? null : null;
  return service;
}

export function useServiceLawyers(serviceId: string | null | undefined): Lawyer[] {
  const { data: lawyers = [] } = useMockQuery<Lawyer>('lawyers');
  const service = useService(serviceId);
  if (!service) return [];
  const ids = new Set(service.lawyerIds);
  return lawyers.filter((l) => ids.has(l.id));
}

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
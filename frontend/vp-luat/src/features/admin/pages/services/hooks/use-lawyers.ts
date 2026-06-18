'use client';

import { useMemo } from 'react';
import { useMockQuery } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Lawyer, Service } from '@/features/admin/types';

export function useLawyers() {
  const { data = [], ...rest } = useMockQuery<Lawyer>('lawyers', undefined, {
    by: 'name',
    dir: 'asc',
  });
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
  return id ? MockDB.getById<Lawyer>('lawyers', id) ?? null : null;
}

export function useLawyerServices(lawyerId: string | null | undefined): Service[] {
  const { data: services = [] } = useMockQuery<Service>('services');
  const lawyer = useLawyer(lawyerId);
  if (!lawyer) return [];
  const ids = new Set(lawyer.serviceIds);
  return services.filter((s) => ids.has(s.id));
}

export function useActiveLawyers(): Lawyer[] {
  const { data: lawyers = [] } = useMockQuery<Lawyer>('lawyers');
  return useMemo(() => lawyers.filter((l) => l.isActive), [lawyers]);
}
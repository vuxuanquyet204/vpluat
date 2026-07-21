'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';

interface ServiceInfo {
  slug: string;
  name: string;
  icon?: string;
}

interface LawyersFilterChipsProps {
  active: 'all' | string;
  onChange: (value: 'all' | string) => void;
  services: ServiceInfo[];
  totalLawyers: number;
  countByServiceSlug: Record<string, number>;
}

export function LawyersFilterChips({ active, onChange, services, totalLawyers, countByServiceSlug }: LawyersFilterChipsProps) {
  const options = useMemo(() => {
    const allOption = {
      id: 'all' as const,
      label: 'Tất cả',
      icon: 'fa-solid fa-users',
      count: totalLawyers,
    };
    const specialtyOptions = (services ?? []).map((s) => ({
      id: s.slug,
      label: s.name,
      icon: s.icon || 'fa-solid fa-gavel',
      count: countByServiceSlug[s.slug] ?? 0,
    }));
    return [allOption, ...specialtyOptions];
  }, [services, totalLawyers, countByServiceSlug]);

  return (
    <FilterBar
      label="Lọc theo dịch vụ"
      options={options}
      active={active}
      onChange={onChange}
      resultCount={totalLawyers}
      resultLabel="luật sư"
    />
  );
}

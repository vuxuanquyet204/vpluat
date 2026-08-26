'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('public.filters');
  const options = useMemo(() => {
    const allOption = {
      id: 'all' as const,
      label: t('all'),
      icon: 'fa-solid fa-users',
      count: totalLawyers,
    };
    const specialtyOptions = (services ?? []).map((s) => ({
      id: s.slug,
      label: t.has(`categories.${s.slug}`) ? t(`categories.${s.slug}`) : s.name,
      icon: s.icon || 'fa-solid fa-gavel',
      count: countByServiceSlug[s.slug] ?? 0,
    }));
    return [allOption, ...specialtyOptions];
  }, [services, totalLawyers, countByServiceSlug, t]);

  return (
    <FilterBar
      ariaLabel={t('byService')}
      label={t('byService')}
      options={options}
      active={active}
      onChange={onChange}
      resultCount={totalLawyers}
      resultLabel={t('lawyers')}
    />
  );
}

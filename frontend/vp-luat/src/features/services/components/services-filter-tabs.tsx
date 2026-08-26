'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import { useServices } from '../hooks/use-services';
import { useTranslations } from 'next-intl';

interface ServicesFilterTabsProps {
  active: string;
  onChange: (value: string) => void;
}

export function ServicesFilterTabs({ active, onChange }: ServicesFilterTabsProps) {
  const t = useTranslations('public.filters');
  const { data: services = [] } = useServices();

  // Nhóm service theo `category` slug (BE trả về). Nếu service không có category
  // (category = null) thì gom vào nhóm "other".
  const grouped = useMemo(() => {
    const groups = new Map<string, { label: string; icon: string; count: number }>();
    services.forEach((s) => {
      const key = s.category || 'other';
      if (!groups.has(key)) {
        groups.set(key, {
          label: t.has(`categories.${key}`) ? t(`categories.${key}`) : key,

          icon: 'fa-solid fa-folder',
          count: 0,
        });
      }
      groups.get(key)!.count += 1;
    });
    return groups;
  }, [services, t]);

  const options = useMemo(() => {
    const allOption = {
      id: 'all',
      label: t('all'),
      icon: 'fa-solid fa-layer-group',
      count: services.length,
    };
    const categoryOptions = Array.from(grouped.entries()).map(([slug, info]) => ({
      id: slug,
      label: info.label,
      icon: info.icon,
      count: info.count,
    }));
    return [allOption, ...categoryOptions];
  }, [services, grouped, t]);

  const resultCount = useMemo(() => {
    if (active === 'all') return services.length;
    return services.filter((s) => (s.category || 'other') === active).length;
  }, [active, services]);

  return (
    <FilterBar
      ariaLabel={t('byCategory')}
      label={t('byCategory')}
      options={options}
      active={active}
      onChange={onChange}
      resultCount={resultCount}
      resultLabel={t('services')}
    />
  );
}
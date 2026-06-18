'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import { SERVICE_CATEGORIES, SERVICES } from '../lib/data/services-data';
import type { ServiceCategory } from '../types';

interface ServicesFilterTabsProps {
  active: 'all' | ServiceCategory;
  onChange: (value: 'all' | ServiceCategory) => void;
}

export function ServicesFilterTabs({ active, onChange }: ServicesFilterTabsProps) {
  const options = useMemo(() => {
    const allOption = {
      id: 'all' as const,
      label: 'Tất cả',
      icon: 'fa-solid fa-layer-group',
      count: SERVICES.length,
    };
    const seen = new Set<string>(['all']);
    const categories = SERVICE_CATEGORIES.filter((c) => !seen.has(c.id))
      .map((cat) => {
        seen.add(cat.id);
        return {
          id: cat.id as ServiceCategory,
          label: cat.label,
          icon: cat.icon,
          count: SERVICES.filter((s) => s.category === (cat.id as ServiceCategory)).length,
        };
      });
    return [allOption, ...categories];
  }, []);

  return (
    <FilterBar
      label="Lọc theo danh mục"
      options={options}
      active={active}
      onChange={onChange}
      resultCount={active === 'all' ? SERVICES.length : SERVICES.filter((s) => s.category === active).length}
      resultLabel="dịch vụ"
    />
  );
}

'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import { LAWYERS, SPECIALTY_FILTERS } from '../lib/data/lawyers-data';
import type { LawyerSpecialty } from '../types';

interface LawyersFilterChipsProps {
  active: 'all' | LawyerSpecialty;
  onChange: (value: 'all' | LawyerSpecialty) => void;
}

export function LawyersFilterChips({ active, onChange }: LawyersFilterChipsProps) {
  const options = useMemo(() => {
    const allOption = {
      id: 'all' as const,
      label: 'Tất cả',
      icon: 'fa-solid fa-users',
      count: LAWYERS.length,
    };
    const seen = new Set<string>(['all']);
    const specialties = SPECIALTY_FILTERS.filter((s) => !seen.has(s.id))
      .map((s) => {
        seen.add(s.id);
        return {
          id: s.id as LawyerSpecialty,
          label: s.label,
          icon: s.icon,
          count: LAWYERS.filter((l) => l.specialties.includes(s.id as LawyerSpecialty)).length,
        };
      });
    return [allOption, ...specialties];
  }, []);

  return (
    <FilterBar
      label="Lọc theo chuyên môn"
      options={options}
      active={active}
      onChange={onChange}
      resultCount={
        active === 'all'
          ? LAWYERS.length
          : LAWYERS.filter((l) => l.specialties.includes(active as LawyerSpecialty)).length
      }
      resultLabel="luật sư"
    />
  );
}

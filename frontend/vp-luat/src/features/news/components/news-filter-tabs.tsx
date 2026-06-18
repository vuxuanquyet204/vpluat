'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import { NEWS_ARTICLES, NEWS_CATEGORIES } from '../lib/data/news-data';
import type { NewsCategory } from '../types';

interface NewsFilterTabsProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
}

export function NewsFilterTabs({ active, onChange }: NewsFilterTabsProps) {
  const options = useMemo(() => {
    const seen = new Set<string>(['all']);
    const rest = NEWS_CATEGORIES.filter((c) => !seen.has(c.id)).map((c) => {
      seen.add(c.id);
      return {
        id: c.id as NewsCategory,
        label: c.label,
        icon: c.icon,
        count: c.count,
      };
    });
    const all = NEWS_CATEGORIES.find((c) => c.id === 'all');
    return [
      {
        id: 'all' as const,
        label: all?.label ?? 'Tất cả',
        icon: all?.icon ?? 'fa-solid fa-layer-group',
        count: all?.count ?? NEWS_ARTICLES.length,
      },
      ...rest,
    ];
  }, []);

  const totalForActive =
    active === 'all'
      ? NEWS_ARTICLES.length
      : NEWS_ARTICLES.filter((a) => a.category === active).length;

  return (
    <FilterBar
      label="Lọc theo danh mục"
      options={options}
      active={active}
      onChange={onChange}
      resultCount={totalForActive}
      resultLabel="bài viết"
    />
  );
}

'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import type { NewsCategory } from '../types';

const CATEGORY_METADATA: ReadonlyArray<{ id: NewsCategory; icon: string }> = [
  { id: 'tin-tuc', icon: 'fa-solid fa-newspaper' },
  { id: 'nghi-dinh', icon: 'fa-solid fa-scale-balanced' },
  { id: 'blog', icon: 'fa-solid fa-pen-nib' },
  { id: 'case-study', icon: 'fa-solid fa-briefcase' },
  { id: 'huong-dan', icon: 'fa-solid fa-circle-info' },
];

const ALL_CATEGORY_ICON = 'fa-solid fa-layer-group';
import type { PostApiResponse } from '../api/news-api';
import { useTranslations } from 'next-intl';

interface NewsFilterTabsProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
  posts?: PostApiResponse[];
}

export function NewsFilterTabs({ active, onChange, posts = [] }: NewsFilterTabsProps) {
  const t = useTranslations('public.filters');
  const options = useMemo(() => {
    // Derive counts from the live posts list instead of trusting the
    // hardcoded `count` field on NEWS_CATEGORIES (it drifts when posts are
    // added or removed by editors).
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });

    const rest = CATEGORY_METADATA.map((category) => ({
      id: category.id,
      label: t(`categories.${category.id}`),
      icon: category.icon,
      count: counts[category.id] ?? 0,
    }));
    return [
      {
        id: 'all' as const,
        label: t('all'),
        icon: ALL_CATEGORY_ICON,
        count: posts.length,
      },
      ...rest,
    ];
  }, [posts, t]);

  const totalForActive =
    active === 'all'
      ? posts.length
      : posts.filter((a) => a.category === active).length;

  return (
    <FilterBar
      label={t('byCategory')}
      options={options}
      active={active}
      onChange={onChange}
      resultCount={totalForActive}
      resultLabel={t('articles')}
    />
  );
}

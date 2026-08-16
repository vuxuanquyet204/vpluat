'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/layout/filter-bar';
import { NEWS_CATEGORIES } from '../lib/data/news-data';
import type { NewsCategory } from '../types';
import type { PostApiResponse } from '../api/news-api';

interface NewsFilterTabsProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
  posts?: PostApiResponse[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'tin-tuc': 'Tin tức',
  'nghi-dinh': 'Nghị định',
  'blog': 'Blog',
  'case-study': 'Case study',
  'huong-dan': 'Hướng dẫn',
};

export function NewsFilterTabs({ active, onChange, posts = [] }: NewsFilterTabsProps) {
  const options = useMemo(() => {
    // Derive counts from the live posts list instead of trusting the
    // hardcoded `count` field on NEWS_CATEGORIES (it drifts when posts are
    // added or removed by editors).
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    });

    const seen = new Set<string>(['all']);
    const rest = NEWS_CATEGORIES.filter((c) => !seen.has(c.id)).map((c) => {
      seen.add(c.id);
      return {
        id: c.id as NewsCategory,
        label: c.label,
        icon: c.icon,
        count: counts[c.id] ?? 0,
      };
    });
    const all = NEWS_CATEGORIES.find((c) => c.id === 'all');
    return [
      {
        id: 'all' as const,
        label: all?.label ?? 'Tất cả',
        icon: all?.icon ?? 'fa-solid fa-layer-group',
        count: posts.length,
      },
      ...rest,
    ];
  }, [posts]);

  const totalForActive =
    active === 'all'
      ? posts.length
      : posts.filter((a) => a.category === active).length;

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

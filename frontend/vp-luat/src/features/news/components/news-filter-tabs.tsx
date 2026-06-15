'use client';

import { NEWS_CATEGORIES } from '../lib/data/news-data';
import type { NewsCategory } from '../types';

interface NewsFilterTabsProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
}

export function NewsFilterTabs({ active, onChange }: NewsFilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Lọc theo danh mục">
      {NEWS_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={active === cat.id}
          className={`filter-tab ${active === cat.id ? 'active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
          <span className="filter-tab__count">{cat.count}</span>
        </button>
      ))}
    </div>
  );
}

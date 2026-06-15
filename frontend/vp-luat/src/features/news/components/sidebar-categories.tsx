'use client';

import { NEWS_CATEGORIES } from '../lib/data/news-data';
import type { NewsCategory } from '../types';

interface SidebarCategoriesProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
}

export function SidebarCategories({ active, onChange }: SidebarCategoriesProps) {
  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-folder-open" aria-hidden="true" />
        Danh mục
      </h3>
      <div className="cat-list">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`cat-list__item ${active === cat.id ? 'active' : ''}`}
            onClick={() => onChange(cat.id)}
          >
            <span>{cat.label}</span>
            <span className="cat-list__count">{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

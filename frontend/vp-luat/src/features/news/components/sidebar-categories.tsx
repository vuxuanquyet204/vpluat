'use client';

import { useCategories } from '../hooks/use-news';
import type { NewsCategory } from '../types';
import { useTranslations } from 'next-intl';

interface SidebarCategoriesProps {
  active: 'all' | NewsCategory;
  onChange: (value: 'all' | NewsCategory) => void;
}

export function SidebarCategories({ active, onChange }: SidebarCategoriesProps) {
  const t = useTranslations('public.news');
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="sidebar-widget">
        <h3 className="sidebar-widget__title">
          <i className="fa-solid fa-folder-open" aria-hidden="true" />
          {t('categoriesTitle')}
        </h3>
        <div className="cat-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-folder-open" aria-hidden="true" />
          {t('categoriesTitle')}
      </h3>
      <div className="cat-list">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`cat-list__item ${active === cat.id ? 'active' : ''}`}
            onClick={() => onChange(cat.id as 'all' | NewsCategory)}
          >
            <span>{cat.label}</span>
            <span className="cat-list__count">{cat.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

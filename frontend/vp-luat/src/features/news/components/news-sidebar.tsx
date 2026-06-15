'use client';

import { SidebarSearch } from './sidebar-search';
import { SidebarCategories } from './sidebar-categories';
import { SidebarPopular } from './sidebar-popular';
import { SidebarTags } from './sidebar-tags';
import { SidebarNewsletter } from './sidebar-newsletter';
import { SidebarCta } from './sidebar-cta';
import type { NewsCategory } from '../types';

interface NewsSidebarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onSearchSubmit?: () => void;
  activeCategory?: 'all' | NewsCategory;
  onCategoryChange?: (v: 'all' | NewsCategory) => void;
  hideSearch?: boolean;
  hideCategories?: boolean;
}

export function NewsSidebar({
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  activeCategory = 'all',
  onCategoryChange,
  hideSearch,
  hideCategories,
}: NewsSidebarProps) {
  return (
    <aside className="sidebar">
      {!hideSearch && (
        <SidebarSearch
          value={searchValue}
          onChange={onSearchChange ?? (() => {})}
          onSubmit={onSearchSubmit ?? (() => {})}
        />
      )}
      {!hideCategories && (
        <SidebarCategories active={activeCategory} onChange={onCategoryChange ?? (() => {})} />
      )}
      <SidebarPopular />
      <SidebarNewsletter />
      <SidebarTags />
      <SidebarCta />
    </aside>
  );
}

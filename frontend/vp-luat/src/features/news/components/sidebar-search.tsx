'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SidebarSearchProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export function SidebarSearch({ value, onChange, onSubmit }: SidebarSearchProps) {
  const t = useTranslations('public.news');
  return (
    <form
      className="sidebar-search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="search"
        className="sidebar-search__input"
        placeholder={t('sidebarSearchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t('searchLabel')}
      />
      <button type="submit" className="sidebar-search__btn" aria-label={t('search')}>
        <Search size={16} />
      </button>
    </form>
  );
}

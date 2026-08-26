'use client';

import { useState, FormEvent } from 'react';
import { Search, Newspaper } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';
import { useTranslations } from 'next-intl';

interface NewsHeroProps {
  onSearch: (query: string) => void;
  defaultQuery?: string;
}

export function NewsHero({ onSearch, defaultQuery = '' }: NewsHeroProps) {
  const t = useTranslations('public.news');
  const [query, setQuery] = useState(defaultQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <PageHero
      eyebrow={t('hero.eyebrow')}
      eyebrowIcon={<Newspaper size={14} aria-hidden />}
      title={t('hero.title')}
      highlight={t('hero.highlight')}
      subtitle={t('hero.subtitle')}
      breadcrumb={[
        { label: t('breadcrumb.home'), href: '/' },
        { label: t('breadcrumb.current') },
      ]}
    >
      <form className="page-hero__search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          className="page-hero__search-input"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('searchLabel')}
        />
        <button type="submit" className="page-hero__search-btn" aria-label={t('search')}>
          <Search size={18} aria-hidden />
        </button>
      </form>
    </PageHero>
  );
}

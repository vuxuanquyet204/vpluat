'use client';

import { useState, FormEvent } from 'react';
import { Search, Newspaper } from 'lucide-react';
import { PageHero } from '@/components/layout/page-hero';

interface NewsHeroProps {
  onSearch: (query: string) => void;
  defaultQuery?: string;
}

export function NewsHero({ onSearch, defaultQuery = '' }: NewsHeroProps) {
  const [query, setQuery] = useState(defaultQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <PageHero
      eyebrow="Tin tức & Kiến thức pháp luật"
      eyebrowIcon={<Newspaper size={14} aria-hidden />}
      title="Cập nhật pháp luật mới nhất"
      highlight="pháp luật"
      subtitle="Tin tức, nghị định, blog chuyên môn và hướng dẫn thủ tục pháp lý từ đội ngũ luật sư VP Luật."
      breadcrumb={[
        { label: 'Trang chủ', href: '/' },
        { label: 'Tin tức' },
      ]}
    >
      <form className="page-hero__search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          className="page-hero__search-input"
          placeholder="Tìm kiếm bài viết, nghị định, thủ tục..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm kiếm bài viết"
        />
        <button type="submit" className="page-hero__search-btn" aria-label="Tìm kiếm">
          <Search size={18} aria-hidden />
        </button>
      </form>
    </PageHero>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';

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
    <section className="page-header news-page-header">
      <div className="container">
        <div className="page-header__inner">
          <div className="page-header__eyebrow">
            <i className="fa-solid fa-newspaper" aria-hidden="true" />
            Tin tức & Kiến thức pháp luật
          </div>
          <h1 className="page-header__title">
            Cập nhật <em>pháp luật</em> mới nhất
          </h1>
          <p className="page-header__sub">
            Tin tức, nghị định, blog chuyên môn và hướng dẫn thủ tục pháp lý từ đội ngũ luật sư VP Luật.
          </p>

          <form className="header-search" onSubmit={handleSubmit} role="search">
            <input
              type="search"
              className="header-search__input"
              placeholder="Tìm kiếm bài viết, nghị định, thủ tục..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm kiếm bài viết"
            />
            <button type="submit" className="header-search__btn" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

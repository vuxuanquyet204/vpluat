'use client';

import { useState, useMemo } from 'react';
import { NewsHero } from '../../components/news-hero';
import { NewsFeatured } from '../../components/news-featured';
import { NewsFilterTabs } from '../../components/news-filter-tabs';
import { ArticleCard } from '../../components/article-card';
import { NewsSidebar } from '../../components/news-sidebar';
import { NewsPagination } from '../../components/news-pagination';
import { NEWS_ARTICLES } from '../../lib/data/news-data';
import type { NewsArticle, NewsCategory } from '../../types';

const PER_PAGE = 6;

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [page, setPage] = useState(1);

  const featured = useMemo(() => {
    return {
      main: NEWS_ARTICLES.find((a) => a.isFeatured) ?? NEWS_ARTICLES[0],
      sides: NEWS_ARTICLES.filter((a) => a.isFeatured && a.id !== (NEWS_ARTICLES.find((x) => x.isFeatured) ?? NEWS_ARTICLES[0]).id).slice(0, 3),
    };
  }, []);

  const filtered = useMemo(() => {
    let list = NEWS_ARTICLES;
    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (appliedQuery) {
      const q = appliedQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list.filter((a) => !a.isFeatured);
  }, [activeCategory, appliedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <NewsHero onSearch={setAppliedQuery} defaultQuery={searchQuery} />

      <NewsFeatured main={featured.main} sides={featured.sides} />

      <section className="main-layout">
        <div className="container">
          <div className="main-layout__grid">
            <main>
              <NewsFilterTabs active={activeCategory} onChange={(v) => { setActiveCategory(v); setPage(1); }} />

              {paginated.length === 0 ? (
                <div className="services-empty">
                  <p>Không có bài viết nào phù hợp.</p>
                </div>
              ) : (
                <div className="news-list">
                  {paginated.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              )}

              <NewsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </main>

            <NewsSidebar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => { setAppliedQuery(searchQuery); setPage(1); }}
              activeCategory={activeCategory}
              onCategoryChange={(v) => { setActiveCategory(v); setPage(1); }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

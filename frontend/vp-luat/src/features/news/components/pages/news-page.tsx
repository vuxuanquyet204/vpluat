'use client';

import { useState, useMemo } from 'react';
import { NewsHero } from '../../components/news-hero';
import { NewsFeatured } from '../../components/news-featured';
import { NewsFilterTabs } from '../../components/news-filter-tabs';
import { ArticleCard } from '../../components/article-card';
import { NewsSidebar } from '../../components/news-sidebar';
import { NewsPagination } from '../../components/news-pagination';
import { usePosts, useFeaturedPosts } from '../../hooks/use-news';
import type { NewsArticle, NewsCategory } from '../../types';

const PER_PAGE = 6;

// Fallback data when API fails
const FALLBACK_CATEGORIES = ['tin-tuc', 'nghi-dinh', 'blog', 'case-study', 'huong-dan'];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedPosts();
  const { data: postsData, isLoading: postsLoading } = usePosts(page - 1, PER_PAGE);

  const featured = useMemo(() => {
    if (!featuredData || featuredData.length === 0) {
      return {
        main: null,
        sides: [],
      };
    }
    return {
      main: featuredData[0] || null,
      sides: featuredData.slice(1, 4),
    };
  }, [featuredData]);

  const allArticles = useMemo(() => {
    if (!postsData?.content) return [];
    return postsData.content;
  }, [postsData]);

  const filtered = useMemo(() => {
    let list = allArticles;
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
    // Exclude featured from the list if showing featured
    if (featured.main) {
      list = list.filter((a) => a.id !== featured.main!.id);
    }
    return list;
  }, [allArticles, activeCategory, appliedQuery, featured]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // When the user filters or changes page, clamp the page number to the
  // available range so pagination never lands on a phantom page.
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const isLoading = featuredLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Đang tải tin tức...</p>
      </div>
    );
  }

  return (
    <>
      <NewsHero onSearch={setAppliedQuery} defaultQuery={searchQuery} />

      {featured.main && <NewsFeatured main={featured.main} sides={featured.sides} />}

      <section className="main-layout">
        <div className="container">
          <div className="main-layout__grid">
            <main>
              <NewsFilterTabs
                active={activeCategory}
                onChange={(v) => { setActiveCategory(v); setPage(1); }}
                posts={allArticles}
              />

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

              <NewsPagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
            </main>

            <NewsSidebar
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => { setAppliedQuery(searchQuery); setPage(1); }}
              activeCategory={activeCategory}
              onCategoryChange={(v) => { setActiveCategory(v); setPage(1); }}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                setAppliedQuery(tag);
                setPage(1);
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

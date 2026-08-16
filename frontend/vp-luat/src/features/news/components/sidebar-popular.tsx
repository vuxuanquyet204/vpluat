'use client';

import Link from 'next/link';
import { usePopularPosts } from '../hooks/use-news';

function formatDate(iso: string) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function SidebarPopular() {
  const { data: popularPosts = [], isLoading } = usePopularPosts(5);

  if (isLoading) {
    return (
      <div className="sidebar-widget">
        <h3 className="sidebar-widget__title">
          <i className="fa-solid fa-fire" aria-hidden="true" />
          Bài viết phổ biến
        </h3>
        <div className="popular-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="popular-item">
              <span className="popular-item__num">{String(i).padStart(2, '0')}</span>
              <div className="popular-item__body">
                <div className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (popularPosts.length === 0) {
    return null;
  }

  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-fire" aria-hidden="true" />
        Bài viết phổ biến
      </h3>
      <div className="popular-list">
        {popularPosts.map((p, i) => (
          <Link key={p.id} href={`/news/${p.slug}`} className="popular-item">
            <span className="popular-item__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="popular-item__body">
              <div className="popular-item__title">{p.title}</div>
              <div className="popular-item__meta">{formatDate(p.publishedAt)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

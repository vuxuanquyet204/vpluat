import { POPULAR_POSTS } from '../lib/data/news-data';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function SidebarPopular() {
  return (
    <div className="sidebar-widget">
      <h3 className="sidebar-widget__title">
        <i className="fa-solid fa-fire" aria-hidden="true" />
        Bài viết phổ biến
      </h3>
      <div className="popular-list">
        {POPULAR_POSTS.map((p, i) => (
          <a key={p.id} href="#" className="popular-item">
            <span className="popular-item__num">{String(i + 1).padStart(2, '0')}</span>
            <div className="popular-item__body">
              <div className="popular-item__title">{p.title}</div>
              <div className="popular-item__meta">{formatDate(p.publishedAt)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

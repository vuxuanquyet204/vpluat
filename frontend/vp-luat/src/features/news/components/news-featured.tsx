import Link from 'next/link';
import { Clock, Eye, Flame } from 'lucide-react';
import type { PostApiResponse } from '../api/news-api';

interface NewsFeaturedProps {
  main: PostApiResponse;
  sides: PostApiResponse[];
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'tin-tuc': 'Tin tức',
    'nghi-dinh': 'Nghị định',
    'blog': 'Blog',
    'case-study': 'Case study',
    'huong-dan': 'Hướng dẫn',
  };
  return labels[category] || category;
}

export function NewsFeatured({ main, sides }: NewsFeaturedProps) {
  if (!main) return null;
  return (
    <section className="featured">
      <div className="container">
        <div className="featured__inner">
          <Link href={`/news/${main.slug}`} className="featured__main">
            {main.thumbnail ? (
              <img src={main.thumbnail} alt={main.title} className="featured__img" />
            ) : (
              <div className="featured__img-placeholder" aria-hidden="true">
                <i className="fa-solid fa-image" />
              </div>
            )}
            <div className="featured__overlay" />
            <div className="featured__content">
              <div className="featured__badges">
                {main.isHot && (
                  <span className="featured__hot">
                    <Flame size={10} style={{ marginRight: '3px' }} />
                    Hot
                  </span>
                )}
                <span className={`featured__cat cat-${main.category}`}>
                  {getCategoryLabel(main.category)}
                </span>
              </div>
              <h2 className="featured__title">{main.title}</h2>
              <p className="featured__excerpt">{main.excerpt}</p>
              <div className="featured__meta">
                <span>
                  <Clock size={12} /> {formatDate(main.publishedAt)}
                </span>
                <span>
                  <Eye size={12} /> {main.views.toLocaleString('vi-VN')} lượt xem
                </span>
              </div>
            </div>
          </Link>

          <div className="featured__side-list">
            {sides.map((s) => (
              <Link key={s.id} href={`/news/${s.slug}`} className="featured__side-item">
                <div className="featured__side-thumb">
                  {s.thumbnail ? (
                    <img src={s.thumbnail} alt={s.title} />
                  ) : (
                    <div
                      className={`featured__side-thumb-placeholder cat-${s.category}-bg`}
                      style={{ background: 'var(--primary-faint)' }}
                    >
                      <i className="fa-solid fa-newspaper" />
                    </div>
                  )}
                </div>
                <div className="featured__side-body">
                  <div className={`featured__side-cat cat-${s.category}`}>
                    {getCategoryLabel(s.category)}
                  </div>
                  <div className="featured__side-title">{s.title}</div>
                  <div className="featured__side-meta">
                    {formatDate(s.publishedAt)} · {s.readingTime} phút
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

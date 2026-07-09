import Link from 'next/link';
import { Clock, Eye, MessageSquare, Image as ImageIcon } from 'lucide-react';
import type { PostApiResponse } from '../api/news-api';

interface ArticleCardProps {
  article: PostApiResponse;
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

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/news/${article.slug}`} className="article-card">
      <div className="article-card__thumb">
        {article.thumbnail ? (
          <img src={article.thumbnail} alt={article.title} loading="lazy" />
        ) : (
          <div className="article-card__thumb-placeholder" style={{ background: 'var(--primary-faint)' }}>
            <ImageIcon size={28} style={{ color: 'var(--gray-400)' }} />
          </div>
        )}
      </div>

      <div className="article-card__body">
        <div className={`article-card__cat cat-${article.category}`}>
          {getCategoryLabel(article.category)}
        </div>
        <h3 className="article-card__title">{article.title}</h3>
        <p className="article-card__excerpt">{article.excerpt}</p>

        <div className="article-card__meta">
          <span className="article-card__author">
            <div
              className="article-card__author-avatar"
              style={{ background: article.author.avatarColor }}
            >
              {article.author.initials}
            </div>
            <span className="article-card__author-name">{article.author.name}</span>
          </span>
          <span className="article-card__meta-item">
            <Clock size={12} /> {formatDate(article.publishedAt)}
          </span>
          <span className="article-card__meta-item">
            <Eye size={12} /> {article.views.toLocaleString('vi-VN')}
          </span>
        </div>
      </div>
    </Link>
  );
}

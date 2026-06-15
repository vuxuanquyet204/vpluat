import Link from 'next/link';
import { Clock, Eye, MessageSquare, Image as ImageIcon } from 'lucide-react';
import type { NewsArticle } from '../types';
import { CATEGORY_LABELS } from '../lib/data/news-data';

interface ArticleCardProps {
  article: NewsArticle;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
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
          {CATEGORY_LABELS[article.category]}
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

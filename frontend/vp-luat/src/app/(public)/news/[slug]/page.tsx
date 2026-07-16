import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock, Eye } from 'lucide-react';
import { Image } from 'lucide-react';
import { NewsSidebar } from '@/features/news/components/news-sidebar';
import type { ApiResponse } from '@/types/api';
import type { PostDTO } from '@/features/news/api/news-api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface PostApiResponse {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categoryName?: string;
  tags: string[];
  author: {
    name: string;
    initials: string;
    avatarColor: string;
  };
  thumbnail?: string;
  publishedAt: string;
  readingTime: number;
  views: number;
  isHot?: boolean;
  isFeatured?: boolean;
}

function mapPostDto(dto: PostDTO): PostApiResponse {
  const authorInitials = dto.authorName
    ? dto.authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const rawDate = dto.publishedAt;
  let publishedAt: string;
  if (!rawDate) {
    publishedAt = dto.createdAt || new Date().toISOString();
  } else if (typeof rawDate === 'string') {
    publishedAt = rawDate;
  } else {
    publishedAt = rawDate.toString();
  }

  const content = dto.content && dto.content.trim().length > 10 ? dto.content : (dto.excerpt || '');

  return {
    id: dto.id,
    slug: dto.slug || '',
    title: dto.title || '',
    excerpt: dto.excerpt || '',
    content,
    category: dto.categoryName?.toLowerCase().replace(/\s+/g, '-') || 'tin-tuc',
    categoryName: dto.categoryName,
    tags: Array.isArray((dto as unknown as Record<string, unknown>).tags) ? ((dto as unknown as Record<string, unknown>).tags as string[]) : [],
    author: {
      name: dto.authorName || 'Author',
      initials: authorInitials,
      avatarColor: 'linear-gradient(135deg, #1E3A5F, #C9A84C)',
    },
    thumbnail: dto.thumbnailUrl,
    publishedAt,
    readingTime: dto.readingTime || 5,
    views: dto.views || 0,
    isHot: !!(dto.views && dto.views > 1000),
    isFeatured: dto.isFeatured || false,
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function getCategoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    'tin-tuc': 'Tin tức',
    'nghi-dinh': 'Nghị định',
    'blog': 'Blog',
    'case-study': 'Case study',
    'huong-dan': 'Hướng dẫn',
  };
  return labels[cat] || cat;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/public/posts/${encodeURIComponent(slug)}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: 'Bài viết không tồn tại' };
    const json: ApiResponse<PostDTO> = await res.json();
    if (!json.success || !json.data) return { title: 'Bài viết không tồn tại' };
    const article = mapPostDto(json.data);
    return {
      title: article.title,
      description: article.excerpt,
      alternates: { canonical: `/news/${article.slug}` },
    };
  } catch {
    return { title: 'Bài viết không tồn tại' };
  }
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let article: PostApiResponse | null = null;
  let relatedArticles: PostApiResponse[] = [];

  try {
    const [detailRes, listRes] = await Promise.all([
      fetch(`${API_BASE}/public/posts/${encodeURIComponent(slug)}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      }),
      fetch(`${API_BASE}/public/posts?page=0&size=10`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      }),
    ]);

    if (detailRes.ok) {
      const detailJson: ApiResponse<PostDTO> = await detailRes.json();
      if (detailJson.success && detailJson.data) {
        article = mapPostDto(detailJson.data);
      }
    }

    if (listRes.ok) {
      const listJson: ApiResponse<{ content: PostDTO[] }> = await listRes.json();
      if (listJson.success && listJson.data?.content) {
        relatedArticles = listJson.data.content
          .filter((p) => p.slug !== slug)
          .slice(0, 3)
          .map(mapPostDto);
      }
    }
  } catch (e) {
    console.error('Failed to fetch article:', e);
  }

  if (!article) notFound();

  const categoryLabel = getCategoryLabel(article!.category);

  return (
    <>
      {/* ── Page Hero ── */}
      <div className="article-hero">
        <div className="container">
          <nav className="article-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span className="sep">/</span>
            <Link href="/news">Tin tức</Link>
            <span className="sep">/</span>
            <span>{article!.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Article Body ── */}
      <div className="article-body">
        <div className="container">
          <div className="article-layout">
            {/* Main Column */}
            <main className="article-main">
              {/* Back link */}
              <Link href="/news" className="article-back">
                <ArrowLeft size={16} aria-hidden /> Quay lại danh sách tin tức
              </Link>

              {/* Category badge */}
              <div className="article-cat">{categoryLabel}</div>

              {/* Title */}
              <h1 className="article-title">{article!.title}</h1>

              {/* Meta row */}
              <div className="article-meta">
                <span className="article-meta__item">
                  <Calendar size={14} aria-hidden />
                  {formatDate(article!.publishedAt)}
                </span>
                <span className="article-meta__author">
                  <div
                    className="article-meta__avatar"
                    style={{ background: article!.author.avatarColor }}
                  >
                    {article!.author.initials}
                  </div>
                  {article!.author.name}
                </span>
                <span className="article-meta__item">
                  <Eye size={14} aria-hidden />
                  {article!.views.toLocaleString('vi-VN')} lượt xem
                </span>
                <span className="article-meta__item article-meta__reading">
                  <Clock size={14} aria-hidden />
                  {article!.readingTime} phút đọc
                </span>
              </div>

              {/* Hero image */}
              {article!.thumbnail && (
                <div className="article-hero-img">
                  <img
                    src={article!.thumbnail}
                    alt={article!.title}
                  />
                </div>
              )}

              {/* Excerpt if content is short */}
              {article!.content && article!.content === article!.excerpt && (
                <div className="article-excerpt">
                  <p>{article!.excerpt}</p>
                </div>
              )}

              {/* Rich content */}
              {article!.content && article!.content !== article!.excerpt && (
                <div
                  className="article-rich-content public-richtext"
                  dangerouslySetInnerHTML={{ __html: article!.content }}
                />
              )}

              {/* Tags */}
              {article!.tags && article!.tags.length > 0 && (
                <div className="article-tags">
                  <strong>
                    <Tag size={14} aria-hidden /> Tags:
                  </strong>
                  {article!.tags.map((t) => (
                    <Link key={t} href={`/news?tag=${encodeURIComponent(t)}`} className="article-tag">
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="article-share">
                <strong>
                  <Share2 size={16} aria-hidden /> Chia sẻ:
                </strong>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=%2Fnews%2F${article!.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chia sẻ Facebook"
                >
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=%2Fnews%2F${article!.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chia sẻ Twitter"
                >
                  <i className="fa-brands fa-twitter" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=%2Fnews%2F${article!.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chia sẻ LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in" />
                </a>
              </div>

              {/* Bottom back link */}
              <div className="article-back-footer">
                <Link href="/news" className="btn btn--outline">
                  <ArrowLeft size={16} aria-hidden /> Quay lại danh sách tin tức
                </Link>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="article-sidebar">
              <NewsSidebar />
            </aside>
          </div>
        </div>
      </div>

      {/* ── Related Articles ── */}
      {relatedArticles.length > 0 && (
        <section className="section section--gray">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">Bài viết liên quan</h2>
            </div>
            <div className="related-grid">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={`/news/${a.slug}`} className="article-card">
                  <div className="article-card__thumb">
                    {a.thumbnail ? (
                      <img src={a.thumbnail} alt={a.title} loading="lazy" />
                    ) : (
                      <div className="article-card__thumb-placeholder">
                        <Image size={28} style={{ color: 'var(--gray-400)' }} />
                      </div>
                    )}
                  </div>
                  <div className="article-card__body">
                    <span className="article-card__cat">
                      {getCategoryLabel(a.category)}
                    </span>
                    <h3 className="article-card__title">{a.title}</h3>
                    <p className="article-card__excerpt">{a.excerpt}</p>
                    <div className="article-card__meta">
                      <span className="article-card__author">
                        <div
                          className="article-card__author-avatar"
                          style={{ background: a.author.avatarColor }}
                        >
                          {a.author.initials}
                        </div>
                        <span className="article-card__author-name">{a.author.name}</span>
                      </span>
                      <span className="article-card__meta-item">
                        <Clock size={12} /> {formatDate(a.publishedAt)}
                      </span>
                      <span className="article-card__meta-item">
                        <Eye size={12} /> {a.views.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

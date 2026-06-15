import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';
import { NEWS_ARTICLES } from '@/features/news/lib/data/news-data';
import { CATEGORY_LABELS } from '@/features/news/lib/data/news-data';
import { NewsSidebar } from '@/features/news/components/news-sidebar';

export function generateStaticParams() {
  return NEWS_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = NEWS_ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: 'Bài viết không tồn tại' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = NEWS_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = NEWS_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);
  const category = CATEGORY_LABELS[article.category] ?? article.category;

  return (
    <main className="article-detail">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <Link href="/news">Tin tức</Link>
          <span>/</span>
          <span>{article.title}</span>
        </nav>

        <div className="article-detail__layout">
          <article className="article-detail__main">
            <header className="article-detail__header">
              <span className="article-detail__category">{category}</span>
              <h1 className="article-detail__title">{article.title}</h1>
              <div className="article-detail__meta">
                <span>
                  <Calendar size={14} aria-hidden /> {new Date(article.publishedAt).toLocaleDateString('vi-VN')}
                </span>
                <span>
                  <User size={14} aria-hidden /> {article.author.name}
                </span>
                <span>
                  <Tag size={14} aria-hidden /> {category}
                </span>
              </div>
            </header>

            <div
              className="article-detail__content public-richtext"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags && article.tags.length > 0 && (
              <div className="article-detail__tags">
                <strong>Tags:</strong>
                {article.tags.map((t) => (
                  <Link key={t} href={`/news?tag=${encodeURIComponent(t)}`} className="article-detail__tag">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            <div className="article-detail__share">
              <strong>
                <Share2 size={16} aria-hidden /> Chia sẻ:
              </strong>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=%2Fnews%2F${article.slug}`}
                aria-label="Share Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=%2Fnews%2F${article.slug}`}
                aria-label="Share Twitter"
              >
                <i className="fa-brands fa-twitter" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=%2Fnews%2F${article.slug}`}
                aria-label="Share LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in" />
              </a>
            </div>

            <div className="article-detail__back">
              <Link href="/news" className="article-detail__back-link">
                <ArrowLeft size={18} aria-hidden /> Quay lại danh sách
              </Link>
            </div>
          </article>

          <NewsSidebar />
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--gray">
          <div className="container">
            <div className="section__header">
              <h2 className="section__title">Bài viết liên quan</h2>
            </div>
            <div className="news-grid">
              {related.map((a) => (
                <Link key={a.slug} href={`/news/${a.slug}`} className="article-card">
                  <div className="article-card__image">
                    <i className="fa-solid fa-newspaper" aria-hidden />
                  </div>
                  <div className="article-card__body">
                    <span className="article-card__category">{CATEGORY_LABELS[a.category] ?? a.category}</span>
                    <h3 className="article-card__title">{a.title}</h3>
                    <p className="article-card__excerpt">{a.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

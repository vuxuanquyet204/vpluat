'use client';

import { Modal } from '@/features/admin/shared';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { BlogPost, Category, Tag } from '@/features/admin/types';

const STATUS_VARIANT: Record<string, StatusVariant> = {
  published: 'green',
  draft: 'yellow',
  scheduled: 'purple',
};

interface PostPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  category: Category | null;
  tags: Tag[];
}

export function PostPreview({ isOpen, onClose, post, category, tags }: PostPreviewProps) {
  if (!post) return null;

  const postTags = post.tags
    .map((id) => tags.find((t) => t.id === id))
    .filter((t): t is Tag => Boolean(t));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Xem trước: ${post.title}`}
      size="lg"
      footer={
        <button type="button" className="action-btn action-btn--primary" onClick={onClose}>
          Đóng
        </button>
      }
    >
      <div
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '0 4px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            flexWrap: 'wrap',
          }}
        >
          <StatusBadge
            label={
              post.status === 'published'
                ? 'Đã xuất bản'
                : post.status === 'draft'
                ? 'Bản nháp'
                : 'Đã lên lịch'
            }
            variant={STATUS_VARIANT[post.status] ?? 'blue'}
          />
          {category && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.7rem',
                fontWeight: 600,
                background: 'var(--info-bg, #EFF6FF)',
                color: 'var(--primary)',
              }}
            >
              {category.name}
            </span>
          )}
          {postTags.map((t) => (
            <span
              key={t.id}
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: '0.7rem',
                fontWeight: 600,
                background: `${t.color}1A`,
                color: t.color,
              }}
            >
              {t.name}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--primary)',
            lineHeight: 1.3,
            margin: '12px 0 8px',
          }}
        >
          {post.title}
        </h1>

        <div
          style={{
            color: 'var(--gray-500)',
            fontSize: '0.82rem',
            marginBottom: 12,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>Tác giả: {post.author}</span>
          <span>·</span>
          <span>Đường dẫn: /blog/{post.slug}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <span>
                Đăng ngày:{' '}
                {new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(new Date(post.publishedAt))}
              </span>
            </>
          )}
        </div>

        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: 280,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 16,
              border: '1px solid var(--gray-200)',
            }}
          />
        )}

        {post.excerpt && (
          <p
            style={{
              fontSize: '1rem',
              fontStyle: 'italic',
              color: 'var(--gray-600)',
              borderLeft: '3px solid var(--accent, #C9A84C)',
              paddingLeft: 12,
              margin: '0 0 16px',
            }}
          >
            {post.excerpt}
          </p>
        )}

        <article
          className="pe-preview__content"
          dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Chưa có nội dung</em></p>' }}
        />
      </div>
    </Modal>
  );
}

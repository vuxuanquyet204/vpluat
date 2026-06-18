'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/features/admin/shared';
import { RichEditor, loadDraft, clearDraft } from '@/features/blog/components';
import type { BlogPost } from '@/features/admin/types';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  onSave: (post: BlogPost) => void;
}

const CATEGORIES = [
  'Doanh nghiệp',
  'Nhà đất',
  'Pháp luật',
  'Sở hữu trí tuệ',
  'Gia đình',
];

const STATUSES: Array<{ value: BlogPost['status']; label: string }> = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Xuất bản ngay' },
  { value: 'scheduled', label: 'Lên lịch' },
];

const STORAGE_KEY = 'blog-post-draft';

interface FormState {
  title: string;
  slug: string;
  category: string;
  status: BlogPost['status'];
  excerpt: string;
  content: string;
  tags: string;
  thumbnail: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function makeEmptyState(): FormState {
  return {
    title: '',
    slug: '',
    category: '',
    status: 'draft',
    excerpt: '',
    content: '',
    tags: '',
    thumbnail: '',
  };
}

export function PostEditorModal({ isOpen, onClose, post, onSave }: PostEditorModalProps) {
  const [form, setForm] = useState<FormState>(makeEmptyState());
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        category: post.category,
        status: post.status,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags.join(', '),
        thumbnail: post.thumbnail ?? '',
      });
      setThumbnailPreview(post.thumbnail ?? '');
      setRestoreNotice(null);
      return;
    }

    const draft = loadDraft(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as FormState & { savedAt: string };
        const ageMs = Date.now() - new Date(parsed.savedAt).getTime();
        if (ageMs < 24 * 60 * 60 * 1000 && parsed.title) {
          const { savedAt: _savedAt, ...rest } = parsed;
          void _savedAt;
          setForm(rest);
          setThumbnailPreview(rest.thumbnail ?? '');
          setRestoreNotice('Đã khôi phục bản nháp tự động lưu.');
        } else {
          setForm(makeEmptyState());
          setThumbnailPreview('');
          setRestoreNotice(null);
        }
      } catch {
        setForm(makeEmptyState());
        setThumbnailPreview('');
        setRestoreNotice(null);
      }
    } else {
      setForm(makeEmptyState());
      setThumbnailPreview('');
      setRestoreNotice(null);
    }
  }, [isOpen, post]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && !post) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  };

  const handleThumbnailChange = (value: string) => {
    setForm((prev) => ({ ...prev, thumbnail: value }));
    setThumbnailPreview(value);
  };

  const handleSubmit = (publish: boolean) => {
    const status: BlogPost['status'] = publish ? 'published' : form.status;
    const now = new Date().toISOString();
    const result: BlogPost = {
      id: post?.id ?? `post-${Date.now()}`,
      title: form.title.trim() || 'Bài viết chưa có tiêu đề',
      slug: form.slug.trim() || slugify(form.title) || `post-${Date.now()}`,
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category || 'Khác',
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      author: post?.author ?? 'Admin',
      thumbnail: form.thumbnail.trim() || undefined,
      publishedAt: status === 'published' ? now : post?.publishedAt,
      scheduledAt: status === 'scheduled' ? now : post?.scheduledAt,
      createdAt: post?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(result);
    clearDraft(STORAGE_KEY);
  };

  const handleClose = () => {
    if (form.title.trim() || form.content.trim()) {
      try {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...form, savedAt: new Date().toISOString() }),
        );
      } catch {
        // ignore
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={post ? 'Sửa bài viết' : 'Viết bài mới'}
      size="lg"
      footer={
        <>
          <button type="button" className="action-btn" onClick={handleClose}>
            Hủy
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => handleSubmit(false)}
          >
            Lưu nháp
          </button>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={() => handleSubmit(true)}
          >
            {post?.status === 'published' ? 'Cập nhật' : 'Xuất bản'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {restoreNotice && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'var(--info-bg, #EFF6FF)',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{restoreNotice}</span>
            <button
              type="button"
              className="action-btn"
              style={{ padding: '2px 10px', fontSize: '0.72rem' }}
              onClick={() => {
                setForm(makeEmptyState());
                setThumbnailPreview('');
                setRestoreNotice(null);
                clearDraft(STORAGE_KEY);
              }}
            >
              Bỏ qua
            </button>
          </div>
        )}

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Tiêu đề
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--gray-600)',
                marginBottom: '4px',
              }}
            >
              Danh mục
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="form-input"
              style={{ background: 'white' }}
            >
              <option value="">Chọn danh mục</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--gray-600)',
                marginBottom: '4px',
              }}
            >
              Trạng thái
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value as BlogPost['status'])}
              className="form-input"
              style={{ background: 'white' }}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Slug (URL thân thiện)
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => handleChange('slug', slugify(e.target.value))}
            placeholder="vd: huong-dan-thanh-lap-cong-ty-2025"
            className="form-input"
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Mô tả ngắn
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="Mô tả ngắn cho bài viết..."
            rows={2}
            className="form-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Ảnh đại diện (URL)
          </label>
          <input
            type="text"
            value={form.thumbnail}
            onChange={(e) => handleThumbnailChange(e.target.value)}
            placeholder="https://..."
            className="form-input"
          />
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Preview"
              style={{
                marginTop: '8px',
                width: '100%',
                maxHeight: '120px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid var(--gray-200)',
              }}
              onError={() => setThumbnailPreview('')}
            />
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Nội dung
          </label>
          <RichEditor
            value={form.content}
            onChange={(v) => handleChange('content', v)}
            placeholder="Bắt đầu viết nội dung bài viết..."
            minHeight={260}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--gray-600)',
              marginBottom: '4px',
            }}
          >
            Tags (phân cách bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="vd: thành lập công ty, doanh nghiệp, pháp luật"
            className="form-input"
          />
        </div>
      </div>
    </Modal>
  );
}

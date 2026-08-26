'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/features/shared/ui/modal';
import { useApiMutation, useApiQuery } from '@/lib/api/hooks';
import {
  postApi,
  categoryApi,
  tagApi,
  type Post,
  type Category,
  type Tag,
} from '@/lib/api/admin-content';
import { notifySuccess, notifyError } from '@/features/admin/lib';
import { Save, Loader2 } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--gray-200)',
  borderRadius: 6,
  fontSize: '0.88rem',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--gray-700)',
  marginBottom: 6,
};

// === POST ===

interface PostFormModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Post | null;
  onSaved?: () => void;
}

export function PostFormModal({ open, onClose, editing, onSaved }: PostFormModalProps) {
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    language: 'vi',
    categoryId: '' as string,
    tags: [] as string[],
    tagInput: '',
  });

  const categoriesQuery = useApiQuery<Category[]>(
    ['admin', 'categories'],
    '/admin/categories',
    undefined,
    { staleTime: 60_000 },
  );
  const tagsQuery = useApiQuery<Tag[]>(
    ['admin', 'tags'],
    '/admin/tags',
    undefined,
    { staleTime: 60_000 },
  );
  const categories: Category[] = Array.isArray(categoriesQuery.data)
    ? categoriesQuery.data
    : [];
  const availableTags: Tag[] = Array.isArray(tagsQuery.data) ? tagsQuery.data : [];

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title ?? '',
        excerpt: editing.excerpt ?? '',
        content: editing.content ?? '',
        status: editing.status,
        language: editing.language ?? 'vi',
        categoryId: editing.categoryId ?? '',
        tags: (editing as Post & { tags?: string[] }).tags ?? [],
        tagInput: '',
      });
    } else if (open) {
      setForm({
        title: '',
        excerpt: '',
        content: '',
        status: 'DRAFT',
        language: 'vi',
        categoryId: '',
        tags: [],
        tagInput: '',
      });
    }
  }, [editing, open]);

  const saveMutation = useApiMutation<Post, Partial<Post>>(
    editing ? 'PUT' : 'POST',
    editing ? `/admin/posts/${editing.id}` : '/admin/posts',
    {
      onSuccess: () => {
        notifySuccess(editing ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết mới');
        onSaved?.();
        onClose();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notifyError('Vui lòng nhập tiêu đề');
      return;
    }
    const payload: Partial<Post> & { tags?: string[]; categoryId?: string } = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content,
      status: form.status,
      language: form.language,
      categoryId: form.categoryId || undefined,
      tags: form.tags,
    };
    saveMutation.mutate(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Sửa bài viết' : 'Viết bài mới'}
      width={640}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--gray-200)',
              background: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="post-form"
            disabled={saveMutation.isPending}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'var(--primary, #1E3A5F)',
              color: 'white',
              borderRadius: 6,
              cursor: saveMutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: saveMutation.isPending ? 0.7 : 1,
            }}
          >
            {saveMutation.isPending ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            {editing ? 'Cập nhật' : 'Tạo bài viết'}
          </button>
        </>
      }
    >
      <form id="post-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Tiêu đề *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
              placeholder="Tiêu đề bài viết..."
            />
          </div>
          <div>
            <label style={labelStyle}>Tóm tắt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              placeholder="Mô tả ngắn về bài viết..."
            />
          </div>
          <div>
            <label style={labelStyle}>Nội dung</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ ...inputStyle, minHeight: 200, resize: 'vertical', fontFamily: 'monospace' }}
              placeholder="Nội dung bài viết (hỗ trợ Markdown)..."
            />
          </div>
          <div>
            <label style={labelStyle}>
              Danh mục{' '}
              <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: 11 }}>
                ({categories.length} mục{categoriesQuery.isLoading ? ' - đang tải...' : ''}
                {categoriesQuery.isError ? ' - lỗi' : ''})
              </span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              style={inputStyle}
              disabled={categoriesQuery.isLoading}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c, idx) => (
                <option key={c.id ?? `${idx}-${c.slug}`} value={c.id ?? ''}>
                  {c.name || c.metaTitleVi || c.metaTitle || c.slug || `Mục ${idx + 1}`}
                </option>
              ))}
            </select>
            {categoriesQuery.isError && (
              <small style={{ color: 'var(--red-600, #dc2626)', fontSize: 12 }}>
                Không tải được danh sách danh mục: {categoriesQuery.error?.message}
              </small>
            )}
            {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && (
              <small style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                Backend trả danh sách rỗng. Hãy tạo danh mục trước tại /admin/categories.
              </small>
            )}
          </div>
          <div>
            <label style={labelStyle}>Thẻ (tags)</label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                padding: 6,
                border: '1px solid var(--gray-200)',
                borderRadius: 6,
                minHeight: 38,
                alignItems: 'center',
              }}
            >
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    background: 'var(--primary-faint, #eef2ff)',
                    color: 'var(--primary, #1E3A5F)',
                    borderRadius: 999,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary, #1E3A5F)',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      fontSize: 14,
                    }}
                    aria-label={`Xóa thẻ ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={form.tagInput}
                onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const raw = form.tagInput.trim().replace(/^#+/, '').toLowerCase();
                    if (!raw) return;
                    if (form.tags.includes(raw)) {
                      setForm({ ...form, tagInput: '' });
                      return;
                    }
                    setForm({
                      ...form,
                      tags: [...form.tags, raw],
                      tagInput: '',
                    });
                  } else if (e.key === 'Backspace' && !form.tagInput && form.tags.length) {
                    setForm({ ...form, tags: form.tags.slice(0, -1) });
                  }
                }}
                placeholder={form.tags.length ? '' : 'Nhập thẻ rồi nhấn Enter hoặc dấu phẩy'}
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  padding: '4px 0',
                  background: 'transparent',
                }}
              />
            </div>
            {availableTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {availableTags
                  .filter((t) => t.slug && !form.tags.includes(t.slug))
                  .slice(0, 10)
                  .map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, tags: [...form.tags, t.slug] })
                      }
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        background: 'transparent',
                        border: '1px dashed var(--gray-300, #d1d5db)',
                        borderRadius: 999,
                        cursor: 'pointer',
                        color: 'var(--gray-600)',
                      }}
                    >
                      + #{t.slug}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                style={inputStyle}
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Xuất bản ngay</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ngôn ngữ</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                style={inputStyle}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

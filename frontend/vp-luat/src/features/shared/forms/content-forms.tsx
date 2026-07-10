'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/features/shared/ui/modal';
import { useApiMutation } from '@/lib/api/hooks';
import { postApi, type Post } from '@/lib/api/admin-content';
import { landingPageApi, type LandingPage } from '@/lib/api/admin-content';
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
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title ?? '',
        excerpt: editing.excerpt ?? '',
        content: editing.content ?? '',
        status: editing.status,
        language: editing.language ?? 'vi',
      });
    } else if (open) {
      setForm({ title: '', excerpt: '', content: '', status: 'DRAFT', language: 'vi' });
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
    saveMutation.mutate(form);
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

// === LANDING PAGE ===

interface LandingFormModalProps {
  open: boolean;
  onClose: () => void;
  editing?: LandingPage | null;
  onSaved?: () => void;
}

export function LandingFormModal({ open, onClose, editing, onSaved }: LandingFormModalProps) {
  const [form, setForm] = useState({
    titleVi: '',
    titleEn: '',
    slug: '',
    content: '{}',
    isPublished: false,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        titleVi: editing.titleVi ?? '',
        titleEn: editing.titleEn ?? '',
        slug: editing.slug ?? '',
        content: '{}',
        isPublished: editing.isPublished,
      });
    } else if (open) {
      setForm({ titleVi: '', titleEn: '', slug: '', content: '{}', isPublished: false });
    }
  }, [editing, open]);

  const saveMutation = useApiMutation<LandingPage, unknown>(
    editing ? 'PUT' : 'POST',
    editing ? `/admin/landing-pages/${editing.id}` : '/admin/landing-pages',
    {
      onSuccess: () => {
        notifySuccess(editing ? 'Đã cập nhật Landing Page' : 'Đã tạo Landing Page mới');
        onSaved?.();
        onClose();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleVi.trim()) {
      notifyError('Vui lòng nhập tiêu đề tiếng Việt');
      return;
    }
    if (!form.slug.trim()) {
      notifyError('Vui lòng nhập slug');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Sửa Landing Page' : 'Tạo Landing Page'}
      width={600}
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
            form="landing-form"
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
            {editing ? 'Cập nhật' : 'Tạo trang'}
          </button>
        </>
      }
    >
      <form id="landing-form" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Tiêu đề tiếng Việt *</label>
            <input
              type="text"
              required
              value={form.titleVi}
              onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
              style={inputStyle}
              placeholder="Dịch vụ ly hôn trọn gói"
            />
          </div>
          <div>
            <label style={labelStyle}>Tiêu đề tiếng Anh</label>
            <input
              type="text"
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              style={inputStyle}
              placeholder="Divorce service package (optional)"
            />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={inputStyle}
              placeholder="dich-vu-ly-hon"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              <span style={{ fontSize: '0.85rem' }}>Xuất bản ngay</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
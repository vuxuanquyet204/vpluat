'use client';

import { X, Plus } from 'lucide-react';
import type { Category, Tag } from '@/features/admin/types';
import { PostImageUploader } from './post-image-uploader';

interface PostEditorSidebarProps {
  // Slug
  slug: string;
  onSlugChange: (v: string) => void;
  // Excerpt
  excerpt: string;
  onExcerptChange: (v: string) => void;
  // Category
  category: string;
  onCategoryChange: (v: string) => void;
  categories: Category[];
  // Tags
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  tags: Tag[];
  // Thumbnail
  thumbnail: string;
  onThumbnailChange: (v: string) => void;
  onThumbnailClear: () => void;
  // Stats
  charCount: number;
  wordCount: number;
  readingMinutes: number;
}

export function PostEditorSidebar({
  slug,
  onSlugChange,
  excerpt,
  onExcerptChange,
  category,
  onCategoryChange,
  categories,
  selectedTagIds,
  onToggleTag,
  tags,
  thumbnail,
  onThumbnailChange,
  onThumbnailClear,
  charCount,
  wordCount,
  readingMinutes,
}: PostEditorSidebarProps) {
  return (
    <aside className="pe-sidebar">
      <div className="pe-sidebar__section">
        <label className="pe-sidebar__label">Slug (URL)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}>/blog/</span>
          <input
            type="text"
            className="form-input"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="bai-viet-moi"
          />
        </div>
      </div>

      <div className="pe-sidebar__section">
        <label className="pe-sidebar__label">Mô tả ngắn (excerpt)</label>
        <textarea
          className="form-input"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Tóm tắt 1-2 câu cho bài viết..."
          rows={3}
          style={{ resize: 'vertical' }}
        />
        <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>
          {excerpt.length}/500 ký tự
        </div>
      </div>

      <div className="pe-sidebar__section">
        <label className="pe-sidebar__label">Danh mục</label>
        <select
          className="form-input"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{ background: 'white' }}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="pe-sidebar__section">
        <label className="pe-sidebar__label">Tags</label>
        {tags.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
            Chưa có tag. Tạo ở tab Tags.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map((t) => {
              const active = selectedTagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onToggleTag(t.id)}
                  className={`pe-tag-chip${active ? ' pe-tag-chip--active' : ''}`}
                  style={
                    active
                      ? {
                          background: t.color,
                          color: 'white',
                          borderColor: t.color,
                        }
                      : {
                          background: `${t.color}1A`,
                          color: t.color,
                          borderColor: `${t.color}33`,
                        }
                  }
                >
                  {active ? <X size={10} /> : <Plus size={10} />}
                  {t.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="pe-sidebar__section">
        <label className="pe-sidebar__label">Ảnh đại diện</label>
        <PostImageUploader
          value={thumbnail}
          onChange={onThumbnailChange}
          onClear={onThumbnailClear}
        />
      </div>

      <div className="pe-sidebar__section pe-sidebar__section--stats">
        <div className="pe-sidebar__stats">
          <span>{charCount.toLocaleString('vi-VN')} ký tự</span>
          <span>·</span>
          <span>{wordCount.toLocaleString('vi-VN')} từ</span>
          <span>·</span>
          <span>~{readingMinutes} phút đọc</span>
        </div>
      </div>
    </aside>
  );
}

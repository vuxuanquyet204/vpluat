'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  AdminPageHeader,
  Badge,
  ActionButtons,
  SearchBar,
  Pagination,
  Modal,
} from '@/features/admin/shared';
import type { BlogPost, PostStatus } from '@/features/admin/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1', title: 'Hướng dẫn thành lập công ty tại Việt Nam 2025',
    slug: 'huong-dan-thanh-lap-cong-ty-2025',
    excerpt: 'Bài viết chi tiết về quy trình thành lập doanh nghiệp tại Việt Nam...',
    content: '', category: 'Doanh nghiệp', tags: ['thành lập công ty', 'doanh nghiệp'],
    status: 'published', author: 'Lan', thumbnail: 'https://picsum.photos/seed/post1/400/200',
    publishedAt: '2025-05-20T00:00:00Z', createdAt: '2025-05-15T00:00:00Z', updatedAt: '2025-05-20T00:00:00Z',
  },
  {
    id: '2', title: 'Những điều cần biết về hợp đồng thuê nhà',
    slug: 'hop-dong-thue-nha',
    excerpt: 'Tìm hiểu các điều khoản quan trọng trong hợp đồng thuê nhà...',
    content: '', category: 'Nhà đất', tags: ['hợp đồng', 'thuê nhà'],
    status: 'published', author: 'Minh', thumbnail: 'https://picsum.photos/seed/post2/400/200',
    publishedAt: '2025-05-18T00:00:00Z', createdAt: '2025-05-10T00:00:00Z', updatedAt: '2025-05-18T00:00:00Z',
  },
  {
    id: '3', title: 'Giải quyết tranh chấp thương mại trong doanh nghiệp',
    slug: 'tranh-chap-thuong-mai',
    excerpt: 'Các phương thức giải quyết tranh chấp thương mại phổ biến...',
    content: '', category: 'Pháp luật', tags: ['tranh chấp', 'thương mại'],
    status: 'draft', author: 'Hùng', createdAt: '2025-05-22T00:00:00Z', updatedAt: '2025-05-22T00:00:00Z',
  },
  {
    id: '4', title: 'Quyền sở hữu trí tuệ trong thời đại số',
    slug: 'so-huu-tri-tue-so',
    excerpt: 'Bảo vệ quyền sở hữu trí tuệ trong môi trường số...',
    content: '', category: 'Sở hữu trí tuệ', tags: ['IP', 'số'],
    status: 'scheduled', author: 'Lan', thumbnail: 'https://picsum.photos/seed/post4/400/200',
    scheduledAt: '2025-06-01T00:00:00Z', createdAt: '2025-05-20T00:00:00Z', updatedAt: '2025-05-24T00:00:00Z',
  },
  {
    id: '5', title: 'Ly hôn thuận tình: Quy trình và thủ tục',
    slug: 'ly-hon-thuan-tinh',
    excerpt: 'Tìm hiểu quy trình ly hôn thuận tình theo quy định pháp luật...',
    content: '', category: 'Gia đình', tags: ['ly hôn', 'hôn nhân'],
    status: 'published', author: 'Minh', thumbnail: 'https://picsum.photos/seed/post5/400/200',
    publishedAt: '2025-05-15T00:00:00Z', createdAt: '2025-05-08T00:00:00Z', updatedAt: '2025-05-15T00:00:00Z',
  },
];

const STATUS_MAP: Record<PostStatus, { label: string; variant: 'green' | 'yellow' | 'purple' }> = {
  published: { label: 'Đã xuất bản', variant: 'green' },
  draft: { label: 'Bản nháp', variant: 'yellow' },
  scheduled: { label: 'Đã lên lịch', variant: 'purple' },
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

// ─── Blog Admin Page ──────────────────────────────────────────────────────────

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const LIMIT = 10;

  const filtered = MOCK_POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Bài viết & Blog"
        subtitle="Quản lý nội dung website"
        actions={
          <button
            type="button"
            className="action-btn action-btn--primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
          >
            <Plus size={14} />
            Viết bài mới
          </button>
        }
      />

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm bài viết theo tiêu đề, danh mục..."
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Trạng thái</th>
                <th>Ngày xuất bản</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    Không có bài viết nào
                  </td>
                </tr>
              ) : (
                paginated.map((post) => {
                  const st = STATUS_MAP[post.status];
                  return (
                    <tr key={post.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {post.thumbnail ? (
                            <img
                              src={post.thumbnail}
                              alt={post.title}
                              style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: '48px', height: '36px', borderRadius: '6px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <ImageIcon size={16} style={{ color: 'var(--gray-400)' }} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>{post.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '2px' }}>{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="blue">{post.category}</Badge>
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>{post.author}</td>
                      <td>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>
                        {formatDate(post.publishedAt ?? post.scheduledAt)}
                      </td>
                      <td>
                        <ActionButtons
                          actions={[
                            { label: 'Xem', variant: 'default', onClick: () => window.open(`/blog/${post.slug}`, '_blank') },
                            { label: 'Sửa', variant: 'default', onClick: () => handleEdit(post) },
                            { label: 'Xóa', variant: 'danger', onClick: () => {} },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
      </div>

      {/* Post Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Sửa bài viết' : 'Viết bài mới'}
        size="lg"
        footer={
          <>
            <button type="button" className="action-btn" onClick={handleCloseModal}>
              Hủy
            </button>
            <button type="button" className="action-btn action-btn--primary">
              {editingPost ? 'Lưu thay đổi' : 'Xuất bản'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
              Tiêu đề
            </label>
            <input
              type="text"
              defaultValue={editingPost?.title ?? ''}
              placeholder="Nhập tiêu đề bài viết..."
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
                Danh mục
              </label>
              <select
                defaultValue={editingPost?.category ?? ''}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: 'white',
                }}
              >
                <option value="">Chọn danh mục</option>
                <option>Doanh nghiệp</option>
                <option>Nhà đất</option>
                <option>Pháp luật</option>
                <option>Sở hữu trí tuệ</option>
                <option>Gia đình</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
                Trạng thái
              </label>
              <select
                defaultValue={editingPost?.status ?? 'draft'}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  background: 'white',
                }}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Xuất bản ngay</option>
                <option value="scheduled">Lên lịch</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
              Mô tả ngắn
            </label>
            <textarea
              defaultValue={editingPost?.excerpt ?? ''}
              placeholder="Mô tả ngắn cho bài viết..."
              rows={3}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
              Nội dung
            </label>
            <div style={{
              border: '1.5px solid var(--gray-200)',
              borderRadius: '8px',
              padding: '12px',
              minHeight: '200px',
              fontSize: '0.85rem',
              color: 'var(--gray-400)',
              cursor: 'text',
            }}>
              {editingPost?.content || 'Nội dung bài viết (Rich Text Editor sẽ được tích hợp ở đây)'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '4px' }}>
              Tags
            </label>
            <input
              type="text"
              defaultValue={editingPost?.tags.join(', ') ?? ''}
              placeholder="Ví dụ: thành lập công ty, doanh nghiệp, pháp luật"
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid var(--gray-200)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

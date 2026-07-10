'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Newspaper, Search, Plus, Eye, Pencil, CheckCircle, Trash2 } from 'lucide-react';
import { postApi, type Post } from '@/lib/api/admin-content';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { PostFormModal } from '@/features/shared/forms/content-forms';
import { ConfirmDialog } from '@/features/shared/ui/modal';
import { notifySuccess, notifyError } from '@/features/admin/lib';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  PUBLISHED: { label: 'Đã xuất bản', color: '#059669', bg: '#ECFDF5', icon: CheckCircle },
  DRAFT: { label: 'Bản nháp', color: '#6B7280', bg: '#F3F4F6', icon: Pencil },
  ARCHIVED: { label: 'Lưu trữ', color: '#DC2626', bg: '#FEE2E2', icon: Pencil },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function StaffBlogPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState<Post | null>(null);

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: Post[];
    totalElements: number;
  }>(
    ['staff-posts'],
    '/admin/posts',
    {
      page: 0,
      size: 100,
      status: filter === 'all' ? undefined : filter,
      search: search || undefined,
    },
    {
      enabled: canAccessNav(userRole, 'blog'),
    }
  );

  const deleteMutation = useApiMutation<void, { id: string }>(
    'DELETE',
    (vars) => `/admin/posts/${vars.id}`,
    {
      onSuccess: () => {
        notifySuccess('Đã xóa bài viết');
        setDeleting(null);
        refetch();
      },
      onError: (err) => notifyError('Lỗi xóa', err.message),
    }
  );

  const publishMutation = useApiMutation<Post, { id: string }>(
    'PATCH',
    (vars) => `/admin/posts/${vars.id}/publish`,
    {
      onSuccess: () => {
        notifySuccess('Đã xuất bản');
        refetch();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const posts = data?.content ?? [];

  if (!canAccessNav(userRole, 'blog')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Bài viết & Blog</h1>
          <p className="admin-page-header__sub">Tổng cộng {data?.totalElements ?? 0} bài viết</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={14} />
            Viết bài mới
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 8
        }}>
          <Search size={16} style={{ color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: '0.88rem',
            background: 'white'
          }}
        >
          <option value="all">Tất cả</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="admin-card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger, #DC2626)' }}>
            Lỗi tải dữ liệu: {error.message}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Tác giả</th>
                  <th>Ngày tạo</th>
                  <th>Lượt xem</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const status = STATUS_CONFIG[post.status] ?? {
                    label: post.status,
                    color: '#6B7280',
                    bg: '#F3F4F6',
                    icon: Pencil,
                  };
                  const Icon = status.icon;
                  return (
                    <tr key={post.id}>
                      <td>
                        <div style={{ fontWeight: 600, maxWidth: 400 }}>{post.title ?? '(không có tiêu đề)'}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          background: status.bg,
                          color: status.color,
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Icon size={11} />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{post.authorName ?? '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{formatDate(post.createdAt)}</td>
                      <td style={{ fontSize: '0.82rem' }}>{(post.views ?? 0).toLocaleString()}</td>
                      <td>
                        <div className="action-btns">
                          {post.status === 'DRAFT' && (
                            <button
                              type="button"
                              className="action-btn"
                              onClick={() => publishMutation.mutate({ id: post.id })}
                              disabled={publishMutation.isPending}
                              title="Xuất bản"
                            >
                              <CheckCircle size={11} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => {
                              setEditing(post);
                              setFormOpen(true);
                            }}
                            title="Sửa"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => {
                              window.open(`/blog/${post.slug}`, '_blank');
                            }}
                            title="Xem trước"
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => setDeleting(post)}
                            title="Xóa"
                            style={{ color: '#DC2626' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {posts.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                <Newspaper size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>Không có bài viết nào</div>
              </div>
            )}
          </div>
        )}
      </div>

      <PostFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate({ id: deleting.id })}
        title="Xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${deleting?.title ?? ''}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
}

void postApi;
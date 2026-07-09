'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Newspaper, Search, Plus, Eye, Pencil, EyeOff, CheckCircle } from 'lucide-react';

const MOCK_POSTS = [
  { id: '1', title: 'Hướng dẫn ly hôn thuận tình 2026', status: 'published', author: 'Admin', createdAt: '08/07/2026', views: 1234 },
  { id: '2', title: 'Quyền nuôi con sau ly hôn', status: 'draft', author: 'Editor 1', createdAt: '09/07/2026', views: 0 },
  { id: '3', title: 'Thủ tục ly hôn đơn phương', status: 'published', author: 'Admin', createdAt: '05/07/2026', views: 2345 },
  { id: '4', title: 'Phân chia tài sản khi ly hôn', status: 'draft', author: 'Editor 2', createdAt: '07/07/2026', views: 0 },
  { id: '5', title: 'Nghĩa vụ cấp dưỡng con sau ly hôn', status: 'published', author: 'Admin', createdAt: '01/07/2026', views: 890 },
];

const STATUS_CONFIG = {
  published: { label: 'Đã xuất bản', color: '#059669', bg: '#ECFDF5', icon: CheckCircle },
  draft: { label: 'Bản nháp', color: '#6B7280', bg: '#F3F4F6', icon: Pencil },
};

export default function StaffBlogPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  if (!canAccessNav(userRole, 'blog')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  const filteredPosts = MOCK_POSTS.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Bài viết & Blog</h1>
          <p className="admin-page-header__sub">Quản lý nội dung website</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn action-btn--primary">
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
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      <div className="admin-card">
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
              {filteredPosts.map((post) => {
                const status = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={post.id}>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 400 }}>{post.title}</div>
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
                        <status.icon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{post.author}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{post.createdAt}</td>
                    <td style={{ fontSize: '0.82rem' }}>{post.views.toLocaleString()}</td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn">
                          <Eye size={11} /> Xem
                        </button>
                        <button className="action-btn">
                          <Pencil size={11} /> Sửa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
            <Newspaper size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>Không có bài viết nào</div>
          </div>
        )}
      </div>
    </div>
  );
}

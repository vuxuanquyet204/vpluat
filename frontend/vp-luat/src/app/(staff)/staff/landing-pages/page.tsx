'use client';

import { LayoutTemplate, Search, Eye, Edit, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';

const MOCK_LANDING_PAGES = [
  { id: '1', title: 'Dịch vụ ly hôn trọn gói', slug: '/dich-vu-ly-hon', views: 5432, conversions: 124, status: 'active' },
  { id: '2', title: 'Tư vấn pháp lý miễn phí', slug: '/tu-van-mien-phi', views: 3210, conversions: 89, status: 'active' },
  { id: '3', title: 'Dịch vụ thế chấp', slug: '/dich-vu-the-chap', views: 1234, conversions: 34, status: 'draft' },
];

export default function StaffLandingPagesPage() {
  const { data: session } = useSession();

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  if (!canAccessNav(userRole, 'landing-pages')) {
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
          <h1 className="admin-page-header__title">Landing Pages</h1>
          <p className="admin-page-header__sub">Quản lý trang đích marketing</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn action-btn--primary">
            <Edit size={14} />
            Tạo Landing Page
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Slug</th>
                <th>Lượt xem</th>
                <th>Chuyển đổi</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LANDING_PAGES.map((page) => (
                <tr key={page.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{page.title}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {page.slug}
                      <ExternalLink size={12} />
                    </div>
                  </td>
                  <td style={{ fontSize: '0.88rem' }}>{page.views.toLocaleString()}</td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{page.conversions}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      background: page.status === 'active' ? '#ECFDF5' : '#F3F4F6',
                      color: page.status === 'active' ? '#059669' : '#6B7280',
                      borderRadius: 20,
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}>
                      {page.status === 'active' ? 'Hoạt động' : 'Bản nháp'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn">
                        <Eye size={11} /> Xem
                      </button>
                      <button className="action-btn">
                        <Edit size={11} /> Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

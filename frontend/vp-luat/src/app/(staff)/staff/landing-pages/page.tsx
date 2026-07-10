'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { LayoutTemplate, Eye, Edit, ExternalLink, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { landingPageApi, type LandingPage } from '@/lib/api';
import { LandingFormModal } from '@/features/shared/forms/content-forms';
import { ConfirmDialog } from '@/features/shared/ui/modal';
import { notifySuccess, notifyError } from '@/features/admin/lib';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function StaffLandingPagesPage() {
  const { data: session } = useSession();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [deleting, setDeleting] = useState<LandingPage | null>(null);

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: LandingPage[];
    totalElements: number;
  }>(
    ['staff-landing-pages'],
    '/admin/landing-pages',
    { page: 0, size: 100 },
    {
      enabled: canAccessNav(userRole, 'landing-pages'),
    }
  );

  const togglePublishMutation = useApiMutation<LandingPage, { id: string; isPublished: boolean }>(
    'PATCH',
    (vars) => `/admin/landing-pages/${vars.id}`,
    {
      onSuccess: (_, vars) => {
        notifySuccess(vars.isPublished ? 'Đã xuất bản' : 'Đã chuyển về bản nháp');
        refetch();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const deleteMutation = useApiMutation<void, { id: string }>(
    'DELETE',
    (vars) => `/admin/landing-pages/${vars.id}`,
    {
      onSuccess: () => {
        notifySuccess('Đã xóa Landing Page');
        setDeleting(null);
        refetch();
      },
      onError: (err) => notifyError('Lỗi', err.message),
    }
  );

  const pages = data?.content ?? [];

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
          <p className="admin-page-header__sub">
            Tổng cộng {data?.totalElements ?? 0} trang đích
          </p>
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
            Tạo Landing Page
          </button>
        </div>
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
                  <th>Slug</th>
                  <th>Lượt xem</th>
                  <th>Chuyển đổi</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{page.titleVi ?? '(không có tiêu đề)'}</div>
                      {page.titleEn && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{page.titleEn}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        /{page.slug}
                        <ExternalLink size={12} />
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{(page.visitCount ?? 0).toLocaleString()}</td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{page.conversionCount ?? 0}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        background: page.isPublished ? '#ECFDF5' : '#F3F4F6',
                        color: page.isPublished ? '#059669' : '#6B7280',
                        borderRadius: 20,
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {page.isPublished ? 'Hoạt động' : 'Bản nháp'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                      {formatDate(page.updatedAt)}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          title="Xem"
                        >
                          <Eye size={11} />
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => {
                            setEditing(page);
                            setFormOpen(true);
                          }}
                          title="Sửa"
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => togglePublishMutation.mutate({ id: page.id, isPublished: !page.isPublished })}
                          disabled={togglePublishMutation.isPending}
                          title={page.isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
                        >
                          {page.isPublished ? <PowerOff size={11} /> : <Power size={11} />}
                        </button>
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => setDeleting(page)}
                          title="Xóa"
                          style={{ color: '#DC2626' }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pages.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                <LayoutTemplate size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>Chưa có landing page nào</div>
              </div>
            )}
          </div>
        )}
      </div>

      <LandingFormModal
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
        title="Xóa Landing Page"
        message={`Bạn có chắc chắn muốn xóa "${deleting?.titleVi ?? ''}"?`}
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
}

void landingPageApi;
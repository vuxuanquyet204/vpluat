'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Users, Search, Plus, Phone, Mail, Eye, Clock } from 'lucide-react';
import { leadApi, type Lead } from '@/lib/api/admin-crm';
import { useApiQuery } from '@/lib/api/hooks';
import { LeadCreateModal, LeadDetailDrawer } from '@/features/shared/forms/lead-forms';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'Mới', color: '#2563EB', bg: '#EFF6FF' },
  CONTACTED: { label: 'Đã liên hệ', color: '#D97706', bg: '#FEF9EF' },
  QUALIFIED: { label: 'Đang tư vấn', color: '#7C3AED', bg: '#F3E8FF' },
  PROPOSAL: { label: 'Đã gửi báo giá', color: '#0891B2', bg: '#ECFEFF' },
  NEGOTIATION: { label: 'Đang đàm phán', color: '#DB2777', bg: '#FCE7F3' },
  WON: { label: 'Đã chuyển đổi', color: '#059669', bg: '#ECFDF5' },
  LOST: { label: 'Mất lead', color: '#DC2626', bg: '#FEE2E2' },
  DUPLICATE: { label: 'Trùng lặp', color: '#6B7280', bg: '#F3F4F6' },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function StaffCrmPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: Lead[];
    totalElements: number;
  }>(
    ['staff-leads'],
    '/crm/leads',
    {
      page: 0,
      size: 100,
      status: filter === 'all' ? undefined : filter,
      search: search || undefined,
    },
    {
      enabled: canAccessNav(userRole, 'crm'),
    }
  );

  const leads = data?.content ?? [];

  if (!canAccessNav(userRole, 'crm')) {
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
          <h1 className="admin-page-header__title">Quản lý Lead / CRM</h1>
          <p className="admin-page-header__sub">
            Tổng cộng {data?.totalElements ?? 0} lead trong hệ thống
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            Thêm Lead mới
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
            placeholder="Tìm kiếm theo tên, số điện thoại..."
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
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = leads.filter((l) => l.status === key).length;
          return (
            <div key={key} style={{
              padding: 16,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 10,
              textAlign: 'center',
              cursor: 'pointer',
              borderTop: `3px solid ${config.color}`
            }}
              onClick={() => setFilter(key === filter ? 'all' : key)}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: config.color }}>{count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: 4 }}>{config.label}</div>
            </div>
          );
        })}
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
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Dịch vụ</th>
                  <th>Trạng thái</th>
                  <th>Người phụ trách</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const status = STATUS_CONFIG[lead.status] ?? {
                    label: lead.status,
                    color: '#6B7280',
                    bg: '#F3F4F6',
                  };
                  return (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {lead.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={12} />{lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
                              <Mail size={12} />{lead.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{lead.serviceName ?? '—'}</td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          background: status.bg,
                          color: status.color,
                          borderRadius: 20,
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {lead.assignedTo?.fullName ?? '—'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            type="button"
                            className="action-btn"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => setSelectedLeadId(lead.id)}
                          >
                            <Eye size={11} /> Xem
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {leads.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>Không có lead nào</div>
              </div>
            )}
          </div>
        )}
      </div>

      <LeadCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refetch()}
      />

      <LeadDetailDrawer
        open={!!selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        leadId={selectedLeadId}
        onUpdated={() => refetch()}
      />
    </div>
  );
}

void leadApi;
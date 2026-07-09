'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Users, Search, Filter, Plus, Phone, Mail, Eye, Clock, UserPlus } from 'lucide-react';

const MOCK_LEADS = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@email.com', service: 'Tư vấn pháp lý', status: 'new', assignedTo: 'CSKH 1', createdAt: '09/07/2026 10:30' },
  { id: '2', name: 'Trần Thị B', phone: '0912345678', email: 'ttb@email.com', service: 'Luật hôn nhân', status: 'contacted', assignedTo: 'CSKH 1', createdAt: '09/07/2026 09:15' },
  { id: '3', name: 'Lê Văn C', phone: '0923456789', email: 'lvc@email.com', service: 'Thủ tục đất đai', status: 'progress', assignedTo: 'CSKH 2', createdAt: '08/07/2026 16:45' },
  { id: '4', name: 'Phạm Thị D', phone: '0934567890', email: 'ptd@email.com', service: 'Hợp đồng', status: 'converted', assignedTo: 'CSKH 1', createdAt: '07/07/2026 11:20' },
  { id: '5', name: 'Hoàng Văn E', phone: '0945678901', email: 'hve@email.com', service: 'Tư vấn pháp lý', status: 'new', assignedTo: 'CSKH 2', createdAt: '09/07/2026 08:00' },
];

const STATUS_CONFIG = {
  new: { label: 'Mới', color: '#2563EB', bg: '#EFF6FF' },
  contacted: { label: 'Đã liên hệ', color: '#D97706', bg: '#FEF9EF' },
  progress: { label: 'Đang tư vấn', color: '#7C3AED', bg: '#F3E8FF' },
  converted: { label: 'Đã chuyển đổi', color: '#059669', bg: '#ECFDF5' },
  lost: { label: 'Mất lead', color: '#DC2626', bg: '#FEE2E2' },
};

export default function StaffCrmPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  if (!canAccessNav(userRole, 'crm')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  const filteredLeads = MOCK_LEADS.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.phone.includes(search)) return false;
    return true;
  });

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Quản lý Lead / CRM</h1>
          <p className="admin-page-header__sub">Theo dõi và quản lý khách hàng tiềm năng</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn action-btn--primary">
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
          <option value="new">Mới</option>
          <option value="contacted">Đã liên hệ</option>
          <option value="progress">Đang tư vấn</option>
          <option value="converted">Đã chuyển đổi</option>
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = MOCK_LEADS.filter(l => l.status === key).length;
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

      {/* Leads Table */}
      <div className="admin-card">
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
              {filteredLeads.map((lead) => {
                const status = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lead.name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={12} />{lead.phone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
                          <Mail size={12} />{lead.email}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{lead.service}</td>
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
                    <td style={{ fontSize: '0.82rem' }}>{lead.assignedTo}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {lead.createdAt}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn" style={{ fontSize: '0.72rem' }}>
                          <Eye size={11} /> Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
            <div>Không có lead nào</div>
          </div>
        )}
      </div>
    </div>
  );
}

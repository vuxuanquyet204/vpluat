'use client';

import { useState } from 'react';
import {
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  FilterTabs,
  Badge,
  RowUser,
  ActionButtons,
  Pagination,
} from '@/features/admin/shared';
import type { Lead, LeadStatus } from '@/features/admin/types';

// ─── Filter Tabs ───────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: 'all', label: 'Tất cả', count: 47 },
  { value: 'new', label: 'Mới', count: 12 },
  { value: 'contacted', label: 'Đã liên hệ', count: 15 },
  { value: 'progress', label: 'Đang xử lý', count: 10 },
  { value: 'converted', label: 'Đã chuyển đổi', count: 7 },
  { value: 'lost', label: 'Mất lead', count: 3 },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901 234 567', email: 'nvana@email.com', service: 'Thành lập công ty', source: 'facebook', status: 'new', assignedTo: 'Lan', createdAt: '2025-05-25T09:00:00Z', updatedAt: '2025-05-25T09:00:00Z' },
  { id: '2', name: 'Trần Thị B', phone: '0902 345 678', email: 'ttb@email.com', service: 'Hợp đồng thuê nhà', source: 'google_ads', status: 'contacted', assignedTo: 'Minh', notes: 'Đã gọi, chưa nghe máy', createdAt: '2025-05-24T14:30:00Z', updatedAt: '2025-05-25T10:00:00Z' },
  { id: '3', name: 'Lê Minh C', phone: '0903 456 789', email: 'lmc@email.com', service: 'Tư vấn pháp luật', source: 'chatbot', status: 'progress', assignedTo: 'Hùng', createdAt: '2025-05-23T11:00:00Z', updatedAt: '2025-05-24T16:00:00Z' },
  { id: '4', name: 'Phạm Hoàng D', phone: '0904 567 890', email: 'phd@email.com', service: 'Sở hữu trí tuệ', source: 'organic', status: 'converted', assignedTo: 'Lan', createdAt: '2025-05-22T08:00:00Z', updatedAt: '2025-05-25T12:00:00Z' },
  { id: '5', name: 'Hoàng Lan E', phone: '0905 678 901', email: 'hle@email.com', service: 'Ly hôn', source: 'facebook', status: 'progress', assignedTo: 'Minh', createdAt: '2025-05-21T15:00:00Z', updatedAt: '2025-05-23T09:00:00Z' },
  { id: '6', name: 'Đặng Quốc F', phone: '0906 789 012', email: 'dqf@email.com', service: 'Thành lập công ty', source: 'referral', status: 'new', assignedTo: 'Hùng', createdAt: '2025-05-25T10:00:00Z', updatedAt: '2025-05-25T10:00:00Z' },
  { id: '7', name: 'Bùi Thị G', phone: '0907 890 123', email: 'btg@email.com', service: 'Mua bán bất động sản', source: 'google_ads', status: 'contacted', assignedTo: 'Lan', createdAt: '2025-05-20T13:00:00Z', updatedAt: '2025-05-22T11:00:00Z' },
  { id: '8', name: 'Vũ Đức H', phone: '0908 901 234', email: 'vdh@email.com', service: 'Giấy phép kinh doanh', source: 'organic', status: 'lost', assignedTo: 'Minh', createdAt: '2025-05-19T16:00:00Z', updatedAt: '2025-05-20T10:00:00Z' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<LeadStatus, { label: string; variant: 'green' | 'yellow' | 'red' | 'blue' | 'purple' }> = {
  new: { label: 'Mới', variant: 'blue' },
  contacted: { label: 'Đã liên hệ', variant: 'yellow' },
  progress: { label: 'Đang xử lý', variant: 'purple' },
  converted: { label: 'Đã chuyển đổi', variant: 'green' },
  lost: { label: 'Mất lead', variant: 'red' },
};

const SOURCE_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  organic: 'Tự nhiên',
  chatbot: 'Chatbot',
  referral: 'Giới thiệu',
  other: 'Khác',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

// ─── CRM Page ─────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const filtered = MOCK_LEADS.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Quản lý Lead / CRM"
        subtitle="Theo dõi và chăm sóc khách hàng tiềm năng"
        actions={
          <button type="button" className="action-btn action-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            Thêm Lead mới
          </button>
        }
      />

      <div className="admin-card">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm theo tên, số điện thoại, email..."
          />
          <button type="button" className="action-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} />
            Xuất Excel
          </button>
        </div>

        <FilterTabs
          tabs={STATUS_TABS}
          activeValue={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Dịch vụ quan tâm</th>
                <th>Nguồn</th>
                <th>Người phụ trách</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    Không có lead nào phù hợp
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => {
                  const statusInfo = STATUS_MAP[lead.status];
                  return (
                    <tr key={lead.id}>
                      <td>
                        <RowUser
                          initials={lead.name}
                          name={lead.name}
                          sub={`${lead.phone} · ${lead.email}`}
                        />
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>{lead.service}</td>
                      <td>
                        <span className={`source-tag source-tag--${lead.source === 'google_ads' ? 'google' : lead.source === 'organic' ? 'organic' : lead.source === 'facebook' ? 'facebook' : lead.source === 'chatbot' ? 'chatbot' : 'referral'}`}>
                          {SOURCE_LABEL[lead.source]}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>{lead.assignedTo}</td>
                      <td>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>
                        {formatDate(lead.createdAt)}
                      </td>
                      <td>
                        <div className="action-btns" style={{ gap: '4px' }}>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 8px' }}
                            title="Gọi điện"
                            aria-label="Gọi điện"
                          >
                            <Phone size={12} />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 8px' }}
                            title="Gửi email"
                            aria-label="Gửi email"
                          >
                            <Mail size={12} />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 8px' }}
                            title="Nhắn tin"
                            aria-label="Nhắn tin"
                          >
                            <MessageSquare size={12} />
                          </button>
                          <button
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 8px' }}
                            title="Khác"
                            aria-label="Khác"
                          >
                            <MoreHorizontal size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={LIMIT}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

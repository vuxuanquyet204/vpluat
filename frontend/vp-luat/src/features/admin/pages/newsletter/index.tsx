'use client';

import { useState } from 'react';
import { Plus, Mail, Download, UserX } from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  Badge,
  ActionButtons,
  Pagination,
} from '@/features/admin/shared';
import type { Subscriber } from '@/features/admin/types';

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: '1', email: 'nvana@email.com', subscribedAt: '2025-05-25T10:00:00Z', status: 'active' },
  { id: '2', email: 'ttb@email.com', subscribedAt: '2025-05-24T14:00:00Z', status: 'active' },
  { id: '3', email: 'lmc@email.com', subscribedAt: '2025-05-23T09:00:00Z', status: 'active' },
  { id: '4', email: 'phd@email.com', subscribedAt: '2025-05-22T16:00:00Z', status: 'active' },
  { id: '5', email: 'hle@email.com', subscribedAt: '2025-05-21T11:00:00Z', status: 'active' },
  { id: '6', email: 'dqf@email.com', subscribedAt: '2025-05-20T08:00:00Z', status: 'unsubscribed' },
  { id: '7', email: 'btg@email.com', subscribedAt: '2025-05-19T15:00:00Z', status: 'active' },
  { id: '8', email: 'vdh@email.com', subscribedAt: '2025-05-18T13:00:00Z', status: 'active' },
];

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export default function NewsletterPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const filtered = MOCK_SUBSCRIBERS.filter(
    (s) => s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const activeCount = MOCK_SUBSCRIBERS.filter((s) => s.status === 'active').length;

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Newsletter"
        subtitle={`${activeCount} người đăng ký đang hoạt động`}
        actions={
          <button type="button" className="action-btn action-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} />
            Gửi Email
          </button>
        }
      />

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm theo email..."
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{s.email}</td>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>{formatDate(s.subscribedAt)}</td>
                  <td>
                    <Badge variant={s.status === 'active' ? 'green' : 'red'}>
                      {s.status === 'active' ? 'Đang hoạt động' : 'Đã hủy'}
                    </Badge>
                  </td>
                  <td>
                    <ActionButtons
                      actions={[
                        { label: 'Gửi email', variant: 'default' as const, onClick: () => {} },
                        ...(s.status === 'active' ? [{ label: 'Hủy đăng ký', variant: 'danger' as const, onClick: () => {} }] : []),
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={LIMIT} total={filtered.length} onPageChange={setPage} />
      </div>
    </div>
  );
}

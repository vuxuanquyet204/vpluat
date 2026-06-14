'use client';

import { useState } from 'react';
import { Plus, Shield, Mail } from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  Badge,
  RowUser,
  ActionButtons,
  Pagination,
} from '@/features/admin/shared';
import type { AdminUser, UserRole } from '@/features/admin/types';

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Hoàng Minh', email: 'admin@vpluat.vn', role: 'super_admin', isActive: true, lastLoginAt: '2025-05-26T09:00:00Z', createdAt: '2025-01-01T00:00:00Z' },
  { id: '2', name: 'Nguyễn Lan', email: 'lan@vpluat.vn', role: 'admin', isActive: true, lastLoginAt: '2025-05-25T14:00:00Z', createdAt: '2025-01-15T00:00:00Z' },
  { id: '3', name: 'Trần Đức Minh', email: 'minh@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: '2025-05-24T10:00:00Z', createdAt: '2025-02-01T00:00:00Z' },
  { id: '4', name: 'Lê Thu Hà', email: 'ha@vpluat.vn', role: 'lawyer', isActive: true, lastLoginAt: '2025-05-23T16:00:00Z', createdAt: '2025-02-10T00:00:00Z' },
  { id: '5', name: 'Phạm Hùng', email: 'hung@vpluat.vn', role: 'staff', isActive: true, lastLoginAt: '2025-05-22T11:00:00Z', createdAt: '2025-03-01T00:00:00Z' },
  { id: '6', name: 'Vũ Anh Tuấn', email: 'tuan@vpluat.vn', role: 'staff', isActive: false, lastLoginAt: '2025-04-15T08:00:00Z', createdAt: '2025-03-15T00:00:00Z' },
];

const ROLE_MAP: Record<UserRole, { label: string; variant: 'green' | 'blue' | 'purple' | 'yellow' }> = {
  super_admin: { label: 'Super Admin', variant: 'yellow' },
  admin: { label: 'Quản trị', variant: 'blue' },
  lawyer: { label: 'Luật sư', variant: 'purple' },
  staff: { label: 'Nhân viên', variant: 'yellow' },
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Người dùng & Phân quyền"
        subtitle="Quản lý tài khoản và phân quyền người dùng"
        actions={
          <button type="button" className="action-btn action-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            Thêm người dùng
          </button>
        }
      />

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm theo tên, email..."
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đăng nhập cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => {
                const role = ROLE_MAP[u.role] ?? { label: u.role, variant: 'blue' as const };
                return (
                  <tr key={u.id}>
                    <td>
                      <RowUser
                        initials={u.name}
                        name={u.name}
                        sub={u.email}
                      />
                    </td>
                    <td>
                      <Badge variant={role.variant}>{role.label}</Badge>
                    </td>
                    <td>
                      <Badge variant={u.isActive ? 'green' : 'red'}>
                        {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>{formatDate(u.lastLoginAt)}</td>
                    <td>
                      <ActionButtons
                        actions={[
                          { label: 'Sửa', variant: 'default', onClick: () => {} },
                          { label: 'Xóa', variant: 'danger', onClick: () => {} },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={page} limit={LIMIT} total={filtered.length} onPageChange={setPage} />
      </div>
    </div>
  );
}

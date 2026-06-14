'use client';

import { useState } from 'react';
import {
  Plus,
  CalendarCheck,
  Clock,
  Phone,
  Mail,
  Video,
  MapPin,
} from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  FilterTabs,
  Badge,
  ActionButtons,
  Pagination,
} from '@/features/admin/shared';
import type { Booking, BookingStatus } from '@/features/admin/types';

const BOOKING_STATUS_TABS = [
  { value: 'all', label: 'Tất cả', count: 38 },
  { value: 'pending', label: 'Chờ xác nhận', count: 12 },
  { value: 'confirmed', label: 'Đã xác nhận', count: 18 },
  { value: 'completed', label: 'Hoàn tất', count: 6 },
  { value: 'cancelled', label: 'Đã hủy', count: 2 },
];

const MOCK_BOOKINGS: Booking[] = [
  { id: '1', customerName: 'Nguyễn Văn A', customerEmail: 'nva@email.com', customerPhone: '0901 234 567', service: 'Tư vấn pháp luật', lawyer: 'LS. Hoàng Lan', method: 'office', date: '2025-05-26', time: '09:00', status: 'pending', createdAt: '2025-05-25T10:00:00Z' },
  { id: '2', customerName: 'Trần Thị B', customerEmail: 'ttb@email.com', customerPhone: '0902 345 678', service: 'Thành lập công ty', lawyer: 'LS. Đức Minh', method: 'online', date: '2025-05-26', time: '10:30', status: 'confirmed', createdAt: '2025-05-24T14:00:00Z' },
  { id: '3', customerName: 'Lê Minh C', customerEmail: 'lmc@email.com', customerPhone: '0903 456 789', service: 'Hợp đồng thuê', lawyer: 'LS. Hoàng Lan', method: 'phone', date: '2025-05-26', time: '14:00', status: 'pending', createdAt: '2025-05-25T08:00:00Z' },
  { id: '4', customerName: 'Phạm Hoàng D', customerEmail: 'phd@email.com', customerPhone: '0904 567 890', service: 'Sở hữu trí tuệ', lawyer: 'LS. Thu Hà', method: 'office', date: '2025-05-25', time: '15:00', status: 'completed', createdAt: '2025-05-22T16:00:00Z' },
  { id: '5', customerName: 'Hoàng Lan E', customerEmail: 'hle@email.com', customerPhone: '0905 678 901', service: 'Ly hôn', lawyer: 'LS. Đức Minh', method: 'online', date: '2025-05-27', time: '11:00', status: 'confirmed', createdAt: '2025-05-24T09:00:00Z' },
  { id: '6', customerName: 'Đặng Quốc F', customerEmail: 'dqf@email.com', customerPhone: '0906 789 012', service: 'Mua bán bất động sản', lawyer: 'LS. Thu Hà', method: 'office', date: '2025-05-27', time: '13:30', status: 'pending', createdAt: '2025-05-26T11:00:00Z' },
];

const STATUS_MAP: Record<BookingStatus, { label: string; variant: 'yellow' | 'blue' | 'green' | 'red' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'blue' },
  completed: { label: 'Hoàn tất', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
  office: <MapPin size={12} />,
  online: <Video size={12} />,
  phone: <Phone size={12} />,
};

const METHOD_LABELS: Record<string, string> = {
  office: 'Tại văn phòng',
  online: 'Trực tuyến',
  phone: 'Qua điện thoại',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.lawyer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Lịch hẹn & Booking"
        subtitle="Quản lý lịch hẹn tư vấn"
        actions={
          <button type="button" className="action-btn action-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} />
            Tạo lịch hẹn
          </button>
        }
      />

      <div className="admin-card">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Tìm theo khách hàng, dịch vụ, luật sư..."
        />

        <FilterTabs
          tabs={BOOKING_STATUS_TABS}
          activeValue={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Luật sư</th>
                <th>Hình thức</th>
                <th>Ngày & Giờ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => {
                const st = STATUS_MAP[b.status];
                return (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{b.customerName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{b.customerPhone}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-600)' }}>{b.service}</td>
                    <td style={{ color: 'var(--gray-600)' }}>{b.lawyer}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gray-600)', fontSize: '0.8rem' }}>
                        {METHOD_ICONS[b.method]}
                        {METHOD_LABELS[b.method]}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.82rem' }}>{formatDate(b.date)}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{b.time}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td>
                      <ActionButtons
                        actions={[
                          { label: 'Xác nhận', variant: b.status === 'pending' ? 'primary' : 'default', onClick: () => {} },
                          { label: 'Hủy', variant: 'danger', onClick: () => {} },
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

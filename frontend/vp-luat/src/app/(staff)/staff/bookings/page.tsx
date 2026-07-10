'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { CalendarDays, Search, Plus, Eye, Phone, Mail } from 'lucide-react';
import { bookingApi, type Appointment } from '@/lib/api/admin-booking';
import { useApiQuery } from '@/lib/api/hooks';
import { BookingActionDrawer, BookingCreateModal } from '@/features/shared/forms/booking-forms';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF' },
  COMPLETED: { label: 'Hoàn tất', color: '#059669', bg: '#ECFDF5' },
  CANCELLED: { label: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' },
};

const METHOD_CONFIG: Record<string, string> = {
  OFFICE: 'Tại VP',
  ONLINE: 'Online',
  PHONE: 'Điện thoại',
};

function formatDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  } catch {
    return { date: iso, time: '' };
  }
}

function BookingCard({
  booking,
  onViewDetail,
}: {
  booking: Appointment;
  onViewDetail: () => void;
}) {
  const status = STATUS_CONFIG[booking.status] ?? {
    label: booking.status,
    color: '#6B7280',
    bg: '#F3F4F6',
  };
  const { date, time } = formatDateTime(booking.scheduledAt);

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 10,
        padding: 16,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onClick={onViewDetail}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{booking.clientName}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{booking.clientPhone}</div>
        </div>
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
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--gray-600)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CalendarDays size={14} />
          {date} - {time}
        </div>
        <div>{booking.serviceName ?? '—'}</div>
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
        Luật sư: {booking.lawyerName ?? '—'}
        {booking.meetingType && ` · ${METHOD_CONFIG[booking.meetingType] ?? booking.meetingType}`}
      </div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--gray-100)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onViewDetail}
          style={{
            padding: '6px 12px',
            background: 'var(--primary-faint, #EFF3F8)',
            color: 'var(--primary, #1E3A5F)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Eye size={12} /> Xem chi tiết
        </button>
      </div>
    </div>
  );
}

export default function StaffBookingsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: Appointment[];
    totalElements: number;
  }>(
    ['staff-bookings'],
    '/bookings',
    {
      page: 0,
      size: 100,
      status: filter === 'all' ? undefined : filter,
    },
    {
      enabled: canAccessNav(userRole, 'bookings'),
    }
  );

  const allBookings = data?.content ?? [];

  const filteredBookings = allBookings.filter((b) => {
    if (search && !b.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!canAccessNav(userRole, 'bookings')) {
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
          <h1 className="admin-page-header__title">Lịch hẹn & Booking</h1>
          <p className="admin-page-header__sub">Tổng cộng {data?.totalElements ?? 0} lịch hẹn</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            Tạo lịch hẹn mới
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
            placeholder="Tìm kiếm theo tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.88rem'
            }}
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

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger, #DC2626)' }}>
          Lỗi tải dữ liệu: {error.message}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewDetail={() => setSelectedBookingId(booking.id)}
              />
            ))}
          </div>

          {filteredBookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
              <CalendarDays size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div>Không có lịch hẹn nào</div>
            </div>
          )}
        </>
      )}

      <BookingCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => refetch()}
      />

      <BookingActionDrawer
        open={!!selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        bookingId={selectedBookingId}
        onUpdated={() => refetch()}
      />
    </div>
  );
}

void bookingApi;
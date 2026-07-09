'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RoleDisplayNames, canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { CalendarDays, Filter, Search, Plus, Eye, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

// Mock data for bookings
const MOCK_BOOKINGS = [
  { id: '1', customerName: 'Nguyễn Văn A', customerPhone: '0901234567', customerEmail: 'nguyenvana@email.com', date: '09/07/2026', time: '09:00', service: 'Tư vấn pháp lý', lawyer: 'Ls. Trần Văn B', status: 'pending', method: 'office' as const },
  { id: '2', customerName: 'Trần Thị C', customerPhone: '0912345678', customerEmail: 'tranthic@email.com', date: '09/07/2026', time: '10:30', service: 'Luật hôn nhân', lawyer: 'Ls. Hoàng Văn D', status: 'confirmed', method: 'online' as const },
  { id: '3', customerName: 'Lê Văn E', customerPhone: '0923456789', customerEmail: 'levane@email.com', date: '09/07/2026', time: '14:00', service: 'Thủ tục đất đai', lawyer: 'Ls. Trần Văn B', status: 'pending', method: 'phone' as const },
  { id: '4', customerName: 'Phạm Thị F', customerPhone: '0934567890', customerEmail: 'phamthif@email.com', date: '10/07/2026', time: '09:00', service: 'Hợp đồng thương mại', lawyer: 'Ls. Hoàng Văn D', status: 'confirmed', method: 'office' as const },
];

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
  confirmed: { label: 'Đã xác nhận', color: '#2563EB', bg: '#EFF6FF' },
  completed: { label: 'Hoàn tất', color: '#059669', bg: '#ECFDF5' },
  cancelled: { label: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' },
};

const METHOD_CONFIG = {
  office: 'Tại VP',
  online: 'Online',
  phone: 'Điện thoại',
};

function BookingCard({ booking }: { booking: typeof MOCK_BOOKINGS[0] }) {
  const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 10,
          padding: 16,
          cursor: 'pointer',
          transition: 'box-shadow 0.2s'
        }}
        onClick={() => setShowDetail(true)}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{booking.customerName}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{booking.customerPhone}</div>
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
            {booking.date} - {booking.time}
          </div>
          <div>{booking.service}</div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
          Luật sư: {booking.lawyer}
        </div>
      </div>

      {showDetail && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
            onClick={() => setShowDetail(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420, maxWidth: '95vw',
            background: 'white',
            borderRadius: 12,
            padding: 24,
            zIndex: 100,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Chi tiết lịch hẹn</h3>
            <DetailRow icon={<Eye size={16} />} label="Mã số" value={`#${booking.id}`} />
            <DetailRow icon={<CalendarDays size={16} />} label="Ngày giờ" value={`${booking.date} - ${booking.time}`} />
            <DetailRow icon={<span style={{ fontSize: '0.8rem' }}>📋</span>} label="Dịch vụ" value={booking.service} />
            <DetailRow icon={<span style={{ fontSize: '0.8rem' }}>👨‍⚖️</span>} label="Luật sư" value={booking.lawyer} />
            <DetailRow icon={<Phone size={16} />} label="Điện thoại" value={booking.customerPhone} />
            <DetailRow icon={<Mail size={16} />} label="Email" value={booking.customerEmail} />
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'var(--primary, #1E3A5F)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div style={{ color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{label}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

export default function StaffBookingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  if (!canAccessNav(userRole, 'bookings')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  const filteredBookings = MOCK_BOOKINGS.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search && !b.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Lịch hẹn & Booking</h1>
          <p className="admin-page-header__sub">Quản lý lịch hẹn khách hàng</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn action-btn--primary">
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
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          <CalendarDays size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Không có lịch hẹn nào</div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { StatusBadge, EmptyStateWithCta } from '@/features/admin/shared';
import type { Booking, BookingStatus } from '@/features/admin/types';

const BOOKING_STATUS_MAP: Record<BookingStatus, { label: string; variant: 'green' | 'yellow' | 'red' | 'blue' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'yellow' },
  confirmed: { label: 'Đã xác nhận', variant: 'blue' },
  completed: { label: 'Hoàn tất', variant: 'green' },
  cancelled: { label: 'Đã hủy', variant: 'red' },
};

interface LeadBookingsTabProps {
  bookings: Booking[];
}

export function LeadBookingsTab({ bookings }: LeadBookingsTabProps) {
  const sorted = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [bookings],
  );

  if (sorted.length === 0) {
    return (
      <EmptyStateWithCta
        icon={<Calendar size={20} />}
        title="Chưa có lịch hẹn"
        description="Lead này chưa đặt lịch hẹn tư vấn nào."
      />
    );
  }

  return (
    <div>
      {sorted.map((b) => {
        const st = BOOKING_STATUS_MAP[b.status];
        return (
          <div
            key={b.id}
            style={{
              padding: '12px 14px',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md, 8px)',
              marginBottom: 8,
              background: 'var(--white)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                  {b.service} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>· {b.lawyer}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
                  <Calendar size={11} />
                  <span>{new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(b.date))}</span>
                  <span>·</span>
                  <Clock size={11} />
                  <span>{b.time}</span>
                </div>
              </div>
              <StatusBadge variant={st.variant} label={st.label} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

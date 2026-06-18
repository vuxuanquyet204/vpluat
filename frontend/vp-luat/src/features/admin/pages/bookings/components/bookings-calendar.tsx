'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, Phone, Video, MapPin } from 'lucide-react';
import { useBookings } from '../hooks/use-bookings';
import { useMockQuery } from '@/features/admin/lib';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Booking, BookingStatus } from '@/features/admin/types';

const STATUS_STYLE: Record<BookingStatus, { variant: StatusVariant; bg: string; color: string; label: string }> = {
  pending: { variant: 'yellow', bg: '#FEF3C7', color: '#92400E', label: 'Chờ' },
  confirmed: { variant: 'blue', bg: '#DBEAFE', color: '#1E40AF', label: 'Xác nhận' },
  completed: { variant: 'green', bg: '#D1FAE5', color: '#065F46', label: 'Hoàn tất' },
  cancelled: { variant: 'red', bg: '#FEE2E2', color: '#991B1B', label: 'Hủy' },
};

const HOURS = Array.from({ length: 11 }, (_, i) => 7 + i); // 07:00 → 17:00
const HOUR_HEIGHT = 48; // px

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

interface BookingsCalendarProps {
  onSelectBooking: (b: Booking) => void;
  onCreateAt: (date: string, time: string) => void;
  lawyerFilter?: string;
}

export function BookingsCalendar({ onSelectBooking, onCreateAt, lawyerFilter = 'all' }: BookingsCalendarProps) {
  const { data: lawyers = [] } = useMockQuery<{ name: string }>('lawyers');
  const bookings = useBookings({ lawyer: lawyerFilter });
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState<'week' | 'day'>('week');

  const dates = useMemo(() => {
    if (view === 'day') return [fmtDate(weekStart)];
    return Array.from({ length: 7 }, (_, i) => fmtDate(addDays(weekStart, i)));
  }, [weekStart, view]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of bookings) {
      if (b.status === 'cancelled') continue;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  const lawyerNames = useMemo(() => lawyers.map((l) => l.name), [lawyers]);

  return (
    <div className="admin-card">
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderBottom: '1px solid var(--gray-200)',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className="action-btn"
          onClick={() => setWeekStart(addDays(weekStart, view === 'day' ? -1 : -7))}
          aria-label="Trước"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          className="action-btn"
          onClick={() => setWeekStart(startOfWeek(new Date()))}
        >
          Hôm nay
        </button>
        <button
          type="button"
          className="action-btn"
          onClick={() => setWeekStart(addDays(weekStart, view === 'day' ? 1 : 7))}
          aria-label="Sau"
        >
          <ChevronRight size={14} />
        </button>
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--gray-700)',
            marginLeft: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CalIcon size={14} />
          {formatRange(weekStart, view)}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {(['week', 'day'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`action-btn ${view === v ? 'action-btn--primary' : ''}`}
              style={{ fontSize: '0.78rem' }}
            >
              {v === 'week' ? 'Tuần' : 'Ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: '8px 12px',
          borderBottom: '1px solid var(--gray-200)',
          fontSize: '0.72rem',
          color: 'var(--gray-500)',
        }}
      >
        {(Object.keys(STATUS_STYLE) as BookingStatus[]).map((s) => {
          const meta = STATUS_STYLE[s];
          return (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: meta.bg, border: `1px solid ${meta.color}` }} />
              {meta.label}
            </span>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `60px repeat(${dates.length}, minmax(120px, 1fr))`,
            minWidth: dates.length === 7 ? 900 : 600,
          }}
        >
          {/* Header row */}
          <div style={{ background: 'var(--gray-50)', borderRight: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }} />
          {dates.map((d) => {
            const date = new Date(d + 'T00:00:00');
            const isToday = d === fmtDate(new Date());
            return (
              <div
                key={d}
                style={{
                  padding: '8px',
                  textAlign: 'center',
                  borderRight: '1px solid var(--gray-200)',
                  borderBottom: '1px solid var(--gray-200)',
                  background: isToday ? 'var(--blue-bg)' : 'var(--gray-50)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--gray-700)' }}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <FragmentRow
              key={hour}
              hour={hour}
              dates={dates}
              bookingsByDate={bookingsByDate}
              onSelectBooking={onSelectBooking}
              onCreateAt={onCreateAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FragmentRow({
  hour,
  dates,
  bookingsByDate,
  onSelectBooking,
  onCreateAt,
}: {
  hour: number;
  dates: string[];
  bookingsByDate: Record<string, Booking[]>;
  onSelectBooking: (b: Booking) => void;
  onCreateAt: (date: string, time: string) => void;
}) {
  return (
    <>
      <div
        style={{
          padding: '4px 6px',
          fontSize: '0.7rem',
          color: 'var(--gray-400)',
          textAlign: 'right',
          borderRight: '1px solid var(--gray-200)',
          borderBottom: '1px solid var(--gray-100)',
          height: HOUR_HEIGHT,
        }}
      >
        {String(hour).padStart(2, '0')}:00
      </div>
      {dates.map((date) => {
        const cellBookings = (bookingsByDate[date] ?? []).filter((b) => {
          const minutes = fmtTime(b.time);
          return Math.floor(minutes / 60) === hour;
        });
        return (
          <CalendarCell
            key={`${date}-${hour}`}
            date={date}
            hour={hour}
            bookings={cellBookings}
            onSelectBooking={onSelectBooking}
            onCreateAt={onCreateAt}
          />
        );
      })}
    </>
  );
}

function CalendarCell({
  date,
  hour,
  bookings,
  onSelectBooking,
  onCreateAt,
}: {
  date: string;
  hour: number;
  bookings: Booking[];
  onSelectBooking: (b: Booking) => void;
  onCreateAt: (date: string, time: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCreateAt(date, `${String(hour).padStart(2, '0')}:00`);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCreateAt(date, `${String(hour).padStart(2, '0')}:00`);
        }
      }}
      style={{
        position: 'relative',
        height: HOUR_HEIGHT,
        borderRight: '1px solid var(--gray-200)',
        borderBottom: '1px solid var(--gray-100)',
        cursor: 'pointer',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {bookings.map((b) => {
        const meta = STATUS_STYLE[b.status];
        const Icon = b.method === 'online' ? Video : b.method === 'phone' ? Phone : MapPin;
        return (
          <button
            key={b.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectBooking(b);
            }}
            title={`${b.customerName} • ${b.time} • ${meta.label}`}
            style={{
              background: meta.bg,
              color: meta.color,
              border: `1px solid ${meta.color}33`,
              borderLeft: `3px solid ${meta.color}`,
              borderRadius: 4,
              padding: '2px 4px',
              fontSize: '0.68rem',
              textAlign: 'left',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontWeight: 700, flexShrink: 0 }}>{b.time}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.customerName}
            </span>
            <Icon size={9} style={{ flexShrink: 0, marginLeft: 'auto' }} />
          </button>
        );
      })}
    </div>
  );
}

function formatRange(start: Date, view: 'week' | 'day'): string {
  if (view === 'day') {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(start);
  }
  const end = addDays(start, 6);
  return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
}

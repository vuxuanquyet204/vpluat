'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAvailability } from '../hooks/use-availability';
import type { Lawyer } from '@/features/admin/types';

interface AvailabilityViewProps {
  onCreateAt: (date: string, time: string, lawyer?: string) => void;
}

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function BookingAvailabilityView({ onCreateAt }: AvailabilityViewProps) {
  const [lawyerId, setLawyerId] = useState<string>('all');
  const [weekStart, setWeekStart] = useState<string>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  });

  const { days, lawyers, isLoading } = useAvailability(lawyerId, weekStart);

  return (
    <div className="admin-card">
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
        <select
          className="action-btn"
          value={lawyerId}
          onChange={(e) => setLawyerId(e.target.value)}
          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
        >
          <option value="all">Tất cả luật sư</option>
          {lawyers.map((l: Lawyer) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="action-btn"
          onClick={() => setWeekStart(shiftWeek(weekStart, -1))}
          aria-label="Tuần trước"
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)' }}>
          Tuần {weekStart}
        </span>
        <button
          type="button"
          className="action-btn"
          onClick={() => setWeekStart(shiftWeek(weekStart, 1))}
          aria-label="Tuần sau"
        >
          <ChevronRight size={14} />
        </button>
        {isLoading && (
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Đang tải...</span>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
          }}
        >
          <thead>
            <tr style={{ background: 'var(--gray-50)' }}>
              <th
                style={{
                  padding: '8px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--gray-200)',
                  minWidth: 60,
                }}
              >
                Slot
              </th>
              {days.map((d) => (
                <th
                  key={d.date}
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--gray-200)',
                    borderLeft: '1px solid var(--gray-100)',
                  }}
                >
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.7rem' }}>
                    {DAY_NAMES[d.dayOfWeek]}
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days[0]?.slots.map((slot, slotIdx) => (
              <tr key={slot.start}>
                <td
                  style={{
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    color: 'var(--gray-500)',
                    borderBottom: '1px solid var(--gray-100)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {slot.start}
                </td>
                {days.map((day) => {
                  const cell = day.slots[slotIdx];
                  if (!cell) {
                    return (
                      <td key={day.date} style={{ borderBottom: '1px solid var(--gray-100)' }} />
                    );
                  }
                  return (
                    <td
                      key={day.date}
                      style={{
                        padding: 2,
                        textAlign: 'center',
                        borderBottom: '1px solid var(--gray-100)',
                        borderLeft: '1px solid var(--gray-100)',
                        minWidth: 70,
                        verticalAlign: 'top',
                      }}
                    >
                      {cell.isAvailable ? (
                        <button
                          type="button"
                          onClick={() => onCreateAt(day.date, cell.start)}
                          className="action-btn"
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.68rem',
                            background: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                          }}
                          title={
                            cell.offLawyerIds.length > 0
                              ? `Còn ${cell.availableCount}/${cell.availableCount + cell.offLawyerIds.length} LS rảnh`
                              : 'Click để tạo lịch hẹn'
                          }
                        >
                          <Plus size={10} /> Rảnh
                        </button>
                      ) : cell.bookings.length === 0 ? (
                        <span
                          style={{ color: 'var(--gray-300)', fontSize: '0.7rem' }}
                          title={
                            cell.offLawyerIds.length > 0
                              ? `Tất cả luật sư đều nghỉ`
                              : '—'
                          }
                        >
                          —
                        </span>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            alignItems: 'stretch',
                          }}
                        >
                          {cell.bookings.map((b) => (
                            <span
                              key={b.bookingId}
                              style={{
                                display: 'block',
                                padding: '2px 4px',
                                background: '#FEF3C7',
                                color: '#92400E',
                                borderRadius: 4,
                                fontSize: '0.66rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={[b.bookingTime, b.customerName, b.lawyerName ? `LS: ${b.lawyerName}` : null]
                                .filter(Boolean)
                                .join(' - ')}
                            >
                              <strong>{b.bookingTime}</strong> {b.customerName}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function shiftWeek(start: string, weeks: number): string {
  const d = new Date(start + 'T00:00:00');
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

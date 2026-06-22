'use client';

import { Mail, Bell, Check, Clock } from 'lucide-react';
import { StatusBadge } from '@/features/admin/shared';
import type { Booking } from '@/features/admin/types';

interface ReminderConfigProps {
  reminders: Booking['reminders'];
  onToggle?: (type: 'h24' | 'h2' | 'm30', enabled: boolean) => void;
  readonly?: boolean;
}

const PRESET_REMINDERS = [
  { type: '24h' as const, key: 'h24' as const, label: '24 giờ trước', description: 'Email nhắc lịch hẹn', icon: Mail },
  { type: '2h' as const, key: 'h2' as const, label: '2 giờ trước', description: 'Email nhắc lịch hẹn', icon: Mail },
  { type: '30m' as const, key: 'm30' as const, label: '30 phút trước', description: 'Email xác nhận cuối', icon: Bell },
];

export function ReminderConfig({ reminders = [], onToggle, readonly }: ReminderConfigProps) {
  const types = new Set(reminders.map((r) => r.type));

  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 8 }}>
        Reminder sẽ tự động gửi tới khách trước giờ hẹn
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PRESET_REMINDERS.map((p) => {
          const active = types.has(p.type);
          const Icon = p.icon;
          return (
            <label
              key={p.type}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                border: '1px solid var(--gray-200)',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: readonly ? 'default' : 'pointer',
                background: active ? '#FFFBEB' : 'var(--white)',
                opacity: readonly && !active ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={active}
                disabled={readonly}
                onChange={(e) => onToggle?.(p.key, e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              <Icon size={16} color={active ? '#D97706' : 'var(--gray-400)'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{p.description}</div>
              </div>
              {active && <Check size={14} color="#059669" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

interface ReminderListProps {
  reminders: Booking['reminders'];
}

export function ReminderList({ reminders = [] }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div style={{ padding: 12, color: 'var(--gray-400)', fontSize: '0.82rem', textAlign: 'center' }}>
        Chưa cấu hình reminder
      </div>
    );
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {reminders.map((r, idx) => {
        const Icon = r.channel === 'email' ? Mail : Bell;
        return (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md, 8px)',
              marginBottom: 6,
              background: r.sent ? '#ECFDF5' : 'var(--white)',
            }}
          >
            <Icon size={14} color={r.sent ? '#059669' : 'var(--gray-400)'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                {r.type === '24h' ? '24 giờ trước' : r.type === '2h' ? '2 giờ trước' : '30 phút trước'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                <Clock size={9} style={{ display: 'inline', marginRight: 2 }} />
                {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(r.scheduledAt))}
              </div>
            </div>
            <StatusBadge
              label={r.sent ? 'Đã gửi' : 'Chờ gửi'}
              variant={r.sent ? 'green' : 'yellow'}
            />
          </li>
        );
      })}
    </ul>
  );
}

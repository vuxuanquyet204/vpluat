'use client';

import {
  UserPlus,
  CalendarClock,
  CalendarX,
  Star,
  Send,
  Bell,
  CircleAlert,
  CircleCheck,
  CircleX,
  Info,
  X,
  Mail,
  MessageSquare,
} from 'lucide-react';
import type { AdminNotification } from '@/features/admin/store';
import Link from 'next/link';

interface Props {
  notification: AdminNotification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  lead_new: UserPlus,
  booking_upcoming: CalendarClock,
  booking_cancelled: CalendarX,
  review_new: Star,
  campaign_sent: Send,
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
  system: Bell,
};

const TYPE_COLOR: Record<string, string> = {
  lead_new: '#0EA5E9',
  booking_upcoming: '#F59E0B',
  booking_cancelled: '#EF4444',
  review_new: '#8B5CF6',
  campaign_sent: '#10B981',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#0EA5E9',
  system: '#6B7280',
};

const CHANNEL_LABEL: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
};

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

export function NotificationItem({ notification, onMarkRead, onRemove, compact }: Props) {
  const Icon = TYPE_ICON[notification.type] ?? Bell;
  const color = TYPE_COLOR[notification.type] ?? '#6B7280';
  const isUnread = !notification.read;

  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: compact ? '8px 12px' : '12px 16px',
        background: isUnread ? 'var(--primary-faint, #EFF3F8)' : 'transparent',
        borderBottom: '1px solid var(--gray-100)',
        position: 'relative',
        transition: 'background 0.15s',
        cursor: notification.link ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (isUnread) onMarkRead(notification.id);
      }}
      onMouseEnter={(e) => {
        if (notification.link)
          e.currentTarget.style.background = 'var(--gray-50)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isUnread
          ? 'var(--primary-faint, #EFF3F8)'
          : 'transparent';
      }}
    >
      {isUnread && (
        <span
          style={{
            position: 'absolute',
            top: 14,
            left: 4,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--primary)',
          }}
          aria-label="Chưa đọc"
        />
      )}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}15`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 2,
          }}
        >
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: isUnread ? 700 : 500,
              color: 'var(--gray-800)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {notification.title}
          </div>
          {notification.channels && notification.channels.length > 0 && !compact && (
            <div style={{ display: 'flex', gap: 2 }}>
              {notification.channels.map((c) => (
                <span
                  key={c}
                  title={CHANNEL_LABEL[c] ?? c}
                  style={{
                    fontSize: '0.6rem',
                    padding: '1px 4px',
                    background: 'var(--gray-100)',
                    color: 'var(--gray-600)',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {c === 'email' ? <Mail size={9} /> : c === 'sms' ? <MessageSquare size={9} /> : <Bell size={9} />}
                </span>
              ))}
            </div>
          )}
        </div>
        {notification.message && (
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--gray-600)',
              marginBottom: 4,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: compact ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {notification.message}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
        aria-label="Xóa thông báo"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--gray-400)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          flexShrink: 0,
        }}
        title="Xóa"
      >
        <X size={14} />
      </button>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }
  return content;
}
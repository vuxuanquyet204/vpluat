'use client';

import { useState } from 'react';
import { Bell, Inbox, CheckCheck, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { notificationApi, type Notification } from '@/lib/api';
import { notifySuccess } from '@/features/admin/lib';

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function StaffNotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userName = session?.user?.name ?? 'Nhân viên';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: Notification[];
    totalElements: number;
  }>(
    ['staff-notifications'],
    '/notifications',
    { page: 0, size: 100 },
    {}
  );

  const markReadMutation = useApiMutation<{ ok: boolean }, { id: string }>(
    'PATCH',
    (vars) => `/notifications/${vars.id}/read`,
    {
      onSuccess: () => refetch(),
    }
  );

  const markAllReadMutation = useApiMutation<{ updated: number }, void>(
    'PATCH',
    `/notifications/read-all`,
    {
      onSuccess: () => {
        notifySuccess('Đã đánh dấu tất cả đã đọc');
        refetch();
      },
    }
  );

  const notifications = data?.content ?? [];
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClick = (n: Notification) => {
    if (!n.isRead) {
      markReadMutation.mutate({ id: n.id });
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Thông báo</h1>
          <p className="admin-page-header__sub">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết'}
            {' '}· {userName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="action-btn"
              onClick={() => markAllReadMutation.mutate(undefined)}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck size={14} />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            background: filter === 'all' ? 'var(--primary, #1E3A5F)' : 'white',
            color: filter === 'all' ? 'white' : 'var(--gray-700)',
            border: '1px solid var(--gray-200)',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '6px 14px',
            background: filter === 'unread' ? 'var(--primary, #1E3A5F)' : 'white',
            color: filter === 'unread' ? 'white' : 'var(--gray-700)',
            border: '1px solid var(--gray-200)',
            borderRadius: 999,
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <div className="admin-card">
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
            Đang tải...
          </div>
        </div>
      ) : error ? (
        <div className="admin-card">
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger, #DC2626)' }}>
            Lỗi: {error.message}
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="admin-card">
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: 'var(--gray-500)',
            }}
          >
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--primary-faint, #EFF3F8)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Bell size={36} style={{ color: 'var(--primary, #1E3A5F)', opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </h3>
            <p style={{ fontSize: '0.88rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              Hệ thống sẽ hiển thị các thông báo về lịch hẹn mới, lead mới, đánh giá
              chờ duyệt và hoạt động khác ngay tại đây.
            </p>
            <div
              style={{
                marginTop: 20,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px',
                background: 'var(--gray-100)',
                borderRadius: 999,
                fontSize: '0.75rem',
                color: 'var(--gray-600)',
              }}
            >
              <Inbox size={12} /> Hộp thư trống
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick(n);
              }}
              style={{
                background: n.isRead ? 'white' : '#F0F7FF',
                border: '1px solid',
                borderColor: n.isRead ? 'var(--gray-200)' : 'var(--primary, #1E3A5F)',
                borderRadius: 10,
                padding: 14,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: n.isRead ? 'var(--gray-100)' : 'var(--primary-faint, #EFF3F8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bell size={16} style={{ color: n.isRead ? 'var(--gray-400)' : 'var(--primary, #1E3A5F)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.9rem' }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', flexShrink: 0, marginLeft: 12 }}>
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  {n.message && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{n.message}</div>
                  )}
                  {n.link && (
                    <div style={{
                      marginTop: 6,
                      fontSize: '0.72rem',
                      color: 'var(--primary, #1E3A5F)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 600,
                    }}>
                      <ExternalLink size={11} /> {n.link}
                    </div>
                  )}
                </div>
                {!n.isRead && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary, #1E3A5F)',
                    marginTop: 6, flexShrink: 0,
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

void notificationApi;
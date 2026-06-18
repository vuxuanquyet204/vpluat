'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAdminUIStore } from '@/features/admin/store';
import { NotificationItem } from './notification-item';

export function NotificationCenter() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
  } = useAdminUIStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const recent = notifications.slice(0, 8);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="admin-topbar__icon-btn"
        onClick={() => setOpen((p) => !p)}
        aria-label="Thông báo"
        aria-expanded={open}
        style={{ position: 'relative' }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: 'var(--danger, #DC2626)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid white',
              boxSizing: 'border-box',
            }}
            aria-label={`${unread} chưa đọc`}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Notification panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 380,
              maxWidth: '95vw',
              maxHeight: 540,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'notifFade 0.18s ease',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--gray-50)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  Thông báo
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                  {unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead()}
                  disabled={unread === 0}
                  className="action-btn"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <Check size={11} /> Đọc hết
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.confirm('Xóa tất cả thông báo?')) {
                      clearNotifications();
                    }
                  }}
                  disabled={notifications.length === 0}
                  className="action-btn"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.7rem',
                    color: 'var(--danger, #DC2626)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="Xóa tất cả"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              {recent.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: 'var(--gray-400)',
                    fontSize: '0.78rem',
                  }}
                >
                  <Bell size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div>Chưa có thông báo nào</div>
                </div>
              ) : (
                recent.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={markNotificationRead}
                    onRemove={removeNotification}
                    compact
                  />
                ))
              )}
            </div>

            <div
              style={{
                padding: '8px 12px',
                borderTop: '1px solid var(--gray-200)',
                background: 'var(--gray-50)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: 'var(--gray-500)',
              }}
            >
              <span>{notifications.length} thông báo (tối đa 50)</span>
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Xem tất cả <ExternalLink size={11} />
              </Link>
            </div>

            <style jsx global>{`
              @keyframes notifFade {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        </>
      )}
    </div>
  );
}
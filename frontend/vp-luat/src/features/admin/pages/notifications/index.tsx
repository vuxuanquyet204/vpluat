'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  X,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { AdminPageHeader, SearchBar, FilterTabs, ConfirmDialog } from '@/features/admin/shared';
import { useAdminUIStore } from '@/features/admin/store';
import { useBookingUpcomingAlerts } from './lib/use-booking-upcoming-alerts';
import { NotificationItem } from '@/features/admin/layout/notification-item';
import type { AdminNotification } from '@/features/admin/store';

const TYPE_TABS: Array<{ value: string; label: string; types: AdminNotification['type'][] }> = [
  { value: 'all', label: 'Tất cả', types: [] },
  {
    value: 'business',
    label: 'Nghiệp vụ',
    types: ['lead_new', 'booking_upcoming', 'booking_cancelled', 'review_new', 'campaign_sent'],
  },
  { value: 'system', label: 'Hệ thống', types: ['system', 'success', 'error', 'warning', 'info'] },
  { value: 'unread', label: 'Chưa đọc', types: [] },
];

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  in_app: <Bell size={12} />,
  email: <Mail size={12} />,
  sms: <Smartphone size={12} />,
};

const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  sms: 'SMS',
};

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
  } = useAdminUIStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmClearRead, setConfirmClearRead] = useState(false);

  useBookingUpcomingAlerts();

  // Tick để cập nhật "time ago"
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => {
    const r = {
      all: notifications.length,
      business: 0,
      system: 0,
      unread: 0,
    };
    for (const n of notifications) {
      if (!n.read) r.unread++;
      if (
        ['lead_new', 'booking_upcoming', 'booking_cancelled', 'review_new', 'campaign_sent'].includes(
          n.type,
        )
      ) {
        r.business++;
      } else {
        r.system++;
      }
    }
    return r;
  }, [notifications]);

  const filtered = useMemo(() => {
    let r = notifications;
    if (tab === 'unread') r = r.filter((n) => !n.read);
    if (tab === 'business') {
      r = r.filter((n) =>
        ['lead_new', 'booking_upcoming', 'booking_cancelled', 'review_new', 'campaign_sent'].includes(
          n.type,
        ),
      );
    }
    if (tab === 'system') {
      r = r.filter((n) =>
        ['system', 'success', 'error', 'warning', 'info'].includes(n.type),
      );
    }
    if (channelFilter !== 'all') {
      r = r.filter((n) => n.channels?.includes(channelFilter as 'in_app' | 'email' | 'sms'));
    }
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.message?.toLowerCase().includes(q) ?? false),
      );
    }
    return r;
  }, [notifications, tab, channelFilter, search]);

  const handleClearRead = () => {
    const remaining = notifications.filter((n) => !n.read);
    useAdminUIStore.setState({ notifications: remaining });
    setConfirmClearRead(false);
  };

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Trung tâm thông báo"
        subtitle={`Quản lý tất cả thông báo trong hệ thống — ${counts.unread} chưa đọc / ${counts.all} tổng`}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="action-btn"
              onClick={() => useBookingUpcomingAlerts() as unknown as void}
              title="Refresh từ mock data"
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} />
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={markAllNotificationsRead}
              disabled={counts.unread === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <CheckCheck size={12} /> Đánh dấu đã đọc hết
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setConfirmClearRead(true)}
              disabled={notifications.length === counts.unread}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Check size={12} /> Xóa đã đọc
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setConfirmClear(true)}
              disabled={notifications.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--danger, #DC2626)',
              }}
            >
              <Trash2 size={12} /> Xóa tất cả
            </button>
          </div>
        }
      />

      <div
        style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: 8,
            alignItems: 'end',
            marginBottom: 12,
          }}
        >
          <SearchBar value={search} onChange={setSearch} placeholder="Tìm trong tiêu đề / nội dung..." />
          <div>
            <label style={lbl()}>Kênh gửi</label>
            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)} style={selStyle()}>
              <option value="all">Tất cả kênh</option>
              <option value="in_app">In-app</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--gray-500)' }}>
            <Filter size={12} />
            {filtered.length} / {notifications.length} kết quả
          </div>
        </div>

        <FilterTabs
          tabs={[
            { value: 'all', label: 'Tất cả', count: counts.all },
            { value: 'unread', label: 'Chưa đọc', count: counts.unread },
            { value: 'business', label: 'Nghiệp vụ', count: counts.business },
            { value: 'system', label: 'Hệ thống', count: counts.system },
          ]}
          activeValue={tab}
          onChange={setTab}
        />
      </div>

      <div
        style={{
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              color: 'var(--gray-500)',
              fontSize: '0.85rem',
            }}
          >
            <Bell size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {notifications.length === 0 ? 'Chưa có thông báo nào' : 'Không có kết quả'}
            </div>
            <div style={{ fontSize: '0.78rem' }}>
              {notifications.length === 0
                ? 'Thông báo sẽ tự động xuất hiện khi có sự kiện mới trong hệ thống.'
                : 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.'}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((n) => (
              <div key={n.id} style={{ position: 'relative' }}>
                <NotificationItem
                  notification={n}
                  onMarkRead={markNotificationRead}
                  onRemove={removeNotification}
                />
                {n.channels && n.channels.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      right: 36,
                      display: 'flex',
                      gap: 3,
                    }}
                  >
                    {n.channels.map((c) => (
                      <span
                        key={c}
                        title={CHANNEL_LABELS[c] ?? c}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          padding: '2px 6px',
                          fontSize: '0.65rem',
                          background: 'var(--gray-100)',
                          color: 'var(--gray-600)',
                          borderRadius: 999,
                          fontWeight: 600,
                        }}
                      >
                        {CHANNEL_ICONS[c]} {CHANNEL_LABELS[c] ?? c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: '0.72rem',
          color: 'var(--gray-400)',
          textAlign: 'right',
        }}
      >
        Hệ thống lưu tối đa 50 thông báo gần nhất.
      </div>

      <ConfirmDialog
        isOpen={confirmClear}
        title="Xóa tất cả thông báo?"
        message="Toàn bộ 50 thông báo gần nhất sẽ bị xóa vĩnh viễn. Hành động không thể hoàn tác."
        confirmLabel="Xóa hết"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={() => {
          clearNotifications();
          setConfirmClear(false);
        }}
        onClose={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        isOpen={confirmClearRead}
        title="Xóa thông báo đã đọc?"
        message={`Sẽ xóa ${notifications.length - counts.unread} thông báo đã đọc, giữ lại ${counts.unread} chưa đọc.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleClearRead}
        onClose={() => setConfirmClearRead(false)}
      />
    </div>
  );
}

void X;
void MessageSquare;

function lbl(): React.CSSProperties {
  return {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--gray-600)',
    marginBottom: 4,
  };
}
function selStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '6px 8px',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 6,
    fontSize: '0.78rem',
    background: 'white',
  };
}
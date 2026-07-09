'use client';

import { Bell, Check, CheckCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Lịch hẹn mới', message: 'Nguyễn Văn A đặt lịch hẹn lúc 09:00 ngày 10/07/2026', time: '5 phút trước', read: false },
  { id: '2', title: 'Lead mới', message: 'Trần Thị B liên hệ về dịch vụ luật hôn nhân', time: '30 phút trước', read: false },
  { id: '3', title: 'Xác nhận lịch hẹn', message: 'Ls. Trần Văn B đã xác nhận lịch hẹn với Lê Văn C', time: '1 giờ trước', read: true },
  { id: '4', title: 'Review mới', message: 'Có 1 đánh giá 5 sao từ khách hàng', time: '2 giờ trước', read: true },
];

export default function StaffNotificationsPage() {
  const { data: session } = useSession();

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Thông báo</h1>
          <p className="admin-page-header__sub">
            {MOCK_NOTIFICATIONS.filter(n => !n.read).length} thông báo chưa đọc
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="action-btn">
            <CheckCheck size={14} />
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            style={{
              background: notif.read ? 'white' : '#F0F7FF',
              border: '1px solid',
              borderColor: notif.read ? 'var(--gray-200)' : 'var(--primary, #1E3A5F)',
              borderRadius: 10,
              padding: 16,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: notif.read ? 'var(--gray-100)' : 'var(--primary-faint, #EFF3F8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bell size={18} style={{ color: notif.read ? 'var(--gray-400)' : 'var(--primary, #1E3A5F)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: notif.read ? 500 : 700 }}>{notif.title}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{notif.time}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--gray-600)' }}>{notif.message}</div>
              </div>
              {!notif.read && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--primary, #1E3A5F)',
                  marginTop: 6
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

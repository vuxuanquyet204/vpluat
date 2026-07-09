'use client';

import { useSession } from 'next-auth/react';
import { User, Bell, Globe, Shield } from 'lucide-react';

export default function StaffSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Cài đặt</h1>
          <p className="admin-page-header__sub">Quản lý tài khoản và tùy chọn</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
        {/* Profile */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} />
              Thông tin cá nhân
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div style={{ width: 80, color: 'var(--gray-500)', fontSize: '0.82rem' }}>Họ tên</div>
              <div style={{ fontWeight: 600 }}>{session?.user?.name ?? 'Người dùng'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div style={{ width: 80, color: 'var(--gray-500)', fontSize: '0.82rem' }}>Email</div>
              <div style={{ fontWeight: 600 }}>{session?.user?.email ?? 'email@example.com'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
              <div style={{ width: 80, color: 'var(--gray-500)', fontSize: '0.82rem' }}>Vai trò</div>
              <div>
                <span style={{
                  padding: '4px 10px',
                  background: 'var(--primary-faint, #EFF3F8)',
                  color: 'var(--primary, #1E3A5F)',
                  borderRadius: 20,
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}>
                  {String(session?.user?.role ?? 'VIEWER')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} />
              Thông báo
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Email thông báo</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Nhận thông báo qua email</div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Âm thanh</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Phát âm thanh khi có thông báo mới</div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={18} />
              Ngôn ngữ
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>Giao diện</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>Chọn ngôn ngữ hiển thị</div>
              </div>
              <select defaultValue="vi" style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--gray-200)' }}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

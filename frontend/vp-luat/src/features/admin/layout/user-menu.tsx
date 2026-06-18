'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, LogOut, Shield, LogIn, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/features/admin/pages/users/hooks/use-admin-auth';
import { useAdminUIStore } from '@/features/admin/store';
import { notifyInfo } from '@/features/admin/lib';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  lawyer: 'Luật sư',
  staff: 'Nhân viên',
};

const ROLE_COLOR: Record<string, string> = {
  super_admin: '#DC2626',
  admin: '#2563EB',
  lawyer: '#10B981',
  staff: '#6B7280',
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function pickColor(name: string): string {
  const palette = ['#1B4D8C', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function UserMenu() {
  const router = useRouter();
  const { currentUser, effectiveUser, isImpersonating, stopImpersonate } = useAdminAuth();
  const { impersonatingUserId, setImpersonating } = useAdminUIStore();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!currentUser) return null;
  const display = effectiveUser ?? currentUser;
  const color = ROLE_COLOR[display.role] ?? pickColor(display.name);
  const initials = getInitials(display.name) || 'A';
  const bgColor = pickColor(display.name);

  const handleStopImpersonate = () => {
    stopImpersonate();
    setImpersonating(null);
    setOpen(false);
    router.refresh();
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-impersonated-user');
      window.localStorage.removeItem('vp-luat-admin-current-user');
    }
    notifyInfo('Đã đăng xuất', 'Vui lòng đăng nhập lại để tiếp tục');
    setOpen(false);
    router.push('/admin/login');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Tài khoản"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 10px 4px 4px',
          background: open ? 'var(--primary-faint, #EFF3F8)' : 'transparent',
          border: '1px solid var(--gray-200)',
          borderRadius: 999,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${bgColor} 0%, ${color} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            flexShrink: 0,
            border: '2px solid white',
            boxShadow: '0 0 0 1px var(--gray-200)',
          }}
        >
          {initials}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-800)' }}>
            {display.name}
          </span>
          <span style={{ fontSize: '0.62rem', color, fontWeight: 700 }}>
            {ROLE_LABEL[display.role] ?? display.role}
          </span>
        </div>
        <ChevronDown size={12} style={{ color: 'var(--gray-500)' }} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 280,
              background: 'white',
              border: '1px solid var(--gray-200)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'userMenuFade 0.18s ease',
            }}
          >
            <div
              style={{
                padding: 16,
                background: `linear-gradient(135deg, ${bgColor}15 0%, ${color}15 100%)`,
                borderBottom: '1px solid var(--gray-200)',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${bgColor} 0%, ${color} 100%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                {initials}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                  {display.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {display.email}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 6px',
                      background: color,
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      borderRadius: 3,
                    }}
                  >
                    {ROLE_LABEL[display.role] ?? display.role}
                  </span>
                </div>
              </div>
            </div>

            {isImpersonating && currentUser && (
              <div
                style={{
                  padding: 10,
                  background: 'var(--warning-faint, #FEF3C7)',
                  borderBottom: '1px solid var(--gray-200)',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ color: 'var(--warning, #B45309)', fontWeight: 600, marginBottom: 4 }}>
                  Đang impersonate
                </div>
                <div style={{ color: 'var(--gray-700)', marginBottom: 6 }}>
                  Bạn đang thao tác với quyền của <strong>{display.name}</strong>.
                  <br />
                  Actor ghi audit: <strong>{currentUser.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleStopImpersonate}
                  className="action-btn"
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    color: 'var(--warning, #B45309)',
                    borderColor: 'var(--warning, #B45309)',
                  }}
                >
                  <Shield size={11} /> Thoát impersonate
                </button>
              </div>
            )}

            <div style={{ padding: 4 }}>
              <MenuLink
                href="/admin/users"
                icon={<User size={13} />}
                label="Hồ sơ của tôi"
                desc="Xem & cập nhật thông tin cá nhân"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/admin/users"
                icon={<Users size={13} />}
                label="Quản lý người dùng"
                desc="RBAC, impersonate, audit"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/admin/settings"
                icon={<Settings size={13} />}
                label="Cài đặt hệ thống"
                desc="Cấu hình chung, SMTP, theme"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/admin/audit"
                icon={<Shield size={13} />}
                label="Audit log cá nhân"
                desc="Lịch sử thao tác của tôi"
                onClick={() => setOpen(false)}
              />
            </div>

            <div
              style={{
                borderTop: '1px solid var(--gray-200)',
                padding: 4,
                background: 'var(--gray-50)',
              }}
            >
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 6,
                  color: 'var(--danger, #DC2626)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={13} /> Đăng xuất
              </button>
            </div>

            <div
              style={{
                padding: '6px 12px',
                background: 'var(--gray-50)',
                borderTop: '1px solid var(--gray-200)',
                fontSize: '0.65rem',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--success, #10B981)',
                  display: 'inline-block',
                }}
              />
              Phiên đăng nhập đang hoạt động
              {impersonatingUserId && (
                <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>impersonating</span>
              )}
            </div>
          </div>
          <style jsx global>{`
            @keyframes userMenuFade {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  label,
  desc,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 6,
        textDecoration: 'none',
        color: 'var(--gray-800)',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'var(--primary-faint, #EFF3F8)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)' }}>{desc}</div>
      </div>
    </Link>
  );
}

void LogIn;
void UserPlus;
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings, LogOut, Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { notifyInfo } from '@/features/admin/lib';
import { clearAuthToken, setLoggingOut } from '@/lib/api/client';
import { RoleDisplayNames, type Role } from '@/features/auth/utils/permissions';

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

const ROLE_COLOR: Record<Role, string> = {
  SUPER_ADMIN: '#DC2626',
  ADMIN: '#2563EB',
  EDITOR: '#8B5CF6',
  CSKH: '#F59E0B',
  LAWYER: '#10B981',
  USER: '#6B7280',
};

export function StaffUserMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  // Don't render if not authenticated
  if (status !== 'authenticated' || !session?.user) return null;

  const userName = session.user.name ?? 'Nhân viên';
  const userEmail = session.user.email ?? '';
  const userRole = (session.user.role as Role) ?? 'VIEWER';
  const roleDisplayName = RoleDisplayNames[userRole] ?? 'Nhân viên';
  const color = ROLE_COLOR[userRole] ?? '#6B7280';
  const initials = getInitials(userName) || 'NV';
  const bgColor = pickColor(userName);

  const handleSignOut = async () => {
    setLoggingOut(true);
    clearAuthToken();
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('admin-impersonated-user');
        window.localStorage.removeItem('vp-luat-admin-current-user');
      } catch {
        // ignore
      }
    }
    setOpen(false);
    notifyInfo('Đã đăng xuất', 'Vui lòng đăng nhập lại để tiếp tục');
    await signOut({ callbackUrl: '/login', redirect: true });
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
            {userName}
          </span>
          <span style={{ fontSize: '0.62rem', color, fontWeight: 700 }}>
            {roleDisplayName}
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
              animation: 'staffUserMenuFade 0.18s ease',
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
                  {userName}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userEmail}
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
                    {roleDisplayName}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: 4 }}>
              <MenuLink
                href="/staff/settings"
                icon={<User size={13} />}
                label="Hồ sơ của tôi"
                desc="Xem & cập nhật thông tin cá nhân"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/staff/notifications"
                icon={<Bell size={13} />}
                label="Thông báo"
                desc="Các thông báo mới nhất"
                onClick={() => setOpen(false)}
              />
              <MenuLink
                href="/staff/settings"
                icon={<Settings size={13} />}
                label="Cài đặt"
                desc="Tùy chọn cá nhân"
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
            </div>
          </div>
          <style jsx global>{`
            @keyframes staffUserMenuFade {
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
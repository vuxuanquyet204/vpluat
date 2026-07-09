'use client';

import { usePathname } from 'next/navigation';
import { useAdminUIStore } from '@/features/admin/store';
import { getNavItemByHref } from '@/features/staff/constants';
import { Menu, Calendar } from 'lucide-react';
import { NotificationCenter } from '@/features/admin/layout/notification-center';
import { LanguageMenu } from '@/features/admin/layout/language-menu';
import { StaffUserMenu } from './staff-user-menu';
import { useSession } from 'next-auth/react';
import { RoleDisplayNames } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';

export function StaffTopbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAdminUIStore();
  const { data: session } = useSession();

  const navItem = getNavItemByHref(pathname);
  const displayTitle = navItem?.label ?? 'Staff Portal';

  const today = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';
  const roleDisplayName = RoleDisplayNames[userRole] ?? 'Nhân viên';

  return (
    <header className="admin-topbar" role="banner">
      <div className="admin-topbar__left">
        <button
          className="admin-topbar__toggle"
          onClick={toggleSidebar}
          aria-label="Mở menu"
          aria-expanded="false"
        >
          <Menu size={18} />
        </button>
        <div className="admin-topbar__title-group">
          <h1 className="admin-topbar__title">{displayTitle}</h1>
          <span className="admin-topbar__date">{today}</span>
        </div>
      </div>

      <div className="admin-topbar__right">
        <div className="admin-topbar__role-badge">
          {roleDisplayName}
        </div>

        <button className="admin-topbar__btn" type="button" aria-label="Hôm nay">
          <Calendar size={14} aria-hidden="true" />
          <span>{today}</span>
        </button>

        <LanguageMenu />

        <NotificationCenter />

        <StaffUserMenu />
      </div>
    </header>
  );
}
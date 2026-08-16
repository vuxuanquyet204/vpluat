'use client';

import { usePathname } from 'next/navigation';
import { useAdminUIStore } from '@/features/admin/store';
import { getNavItemByHref } from '@/features/admin/constants';
import { Menu, Calendar } from 'lucide-react';
import { NotificationCenter } from './notification-center';
import { ReportsMenu } from './reports-menu';
import { LanguageMenu } from './language-menu';
import { UserMenu } from './user-menu';

export function AdminTopbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAdminUIStore();

  const navItem = pathname === '/admin' ? getNavItemByHref('/admin/dashboard') : getNavItemByHref(pathname);

  const displayTitle = navItem?.label ?? 'Admin Panel';

  const today = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

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
        <div className="admin-topbar__date" aria-label="Ngày hôm nay">
          <Calendar size={14} aria-hidden="true" />
          <span>{today}</span>
        </div>

        <ReportsMenu />

        <LanguageMenu />

        <NotificationCenter />

        <UserMenu />
      </div>
    </header>
  );
}
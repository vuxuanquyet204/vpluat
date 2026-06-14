'use client';

import { usePathname } from 'next/navigation';
import { useAdminUIStore } from '@/features/admin/store';
import { getNavItemByHref } from '@/features/admin/constants';
import { Menu } from 'lucide-react';

export function AdminTopbar() {
  const pathname = usePathname();
  const { toggleSidebar } = useAdminUIStore();

  // Find matching nav item by href prefix
  const navItem = getNavItemByHref(
    Object.keys(
      Object.fromEntries(
        pathname === '/admin' ? [['/admin/dashboard', '']] : [],
      ),
    )[0] ?? pathname,
  );

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
        <button className="admin-topbar__btn" type="button">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{today}</span>
        </button>

        <button className="admin-topbar__btn admin-topbar__btn--primary" type="button">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 16 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Xuất báo cáo
        </button>

        <button
          className="admin-topbar__icon-btn"
          type="button"
          aria-label="Thông báo"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="admin-topbar__notification-dot" aria-hidden="true" />
        </button>

        <button
          className="admin-topbar__icon-btn"
          type="button"
          aria-label="Ngôn ngữ"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

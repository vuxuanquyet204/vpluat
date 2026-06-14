'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminUIStore } from '@/features/admin/store';
import { ADMIN_NAV_SECTIONS } from '@/features/admin/constants';
import { Scale } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useAdminUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar--open' : ''}`}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-icon">
            <Scale size={18} strokeWidth={2.5} />
          </div>
          <div className="admin-sidebar__logo-text">
            <div className="admin-sidebar__logo-name">VP Luật</div>
            <div className="admin-sidebar__logo-sub">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="admin-sidebar__section-label">
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`admin-sidebar__item ${isActive ? 'admin-sidebar__item--active' : ''}`}
                    onClick={closeSidebar}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon size={16} strokeWidth={1.8} aria-hidden="true" />
                    <span className="admin-sidebar__item-label">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`admin-sidebar__badge ${item.badgeVariant === 'red' ? 'admin-sidebar__badge--red' : ''}`}
                        aria-label={`${item.badge} thông báo`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {section.label !== ADMIN_NAV_SECTIONS[ADMIN_NAV_SECTIONS.length - 1].label && (
                <div className="admin-sidebar__divider" />
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">HT</div>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">Hoàng Minh</span>
              <span className="admin-sidebar__user-role">Quản trị viên</span>
            </div>
          </div>
          <Link href="/api/auth/signout" className="admin-sidebar__logout">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </Link>
        </div>
      </aside>
    </>
  );
}

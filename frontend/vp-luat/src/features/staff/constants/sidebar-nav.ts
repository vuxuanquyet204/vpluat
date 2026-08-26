import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Newspaper,
  Star,
  Bell,
  Settings,
} from 'lucide-react';

import {
  RoleDisplayNames,
  ROLE_NAV_CONFIG,
  type Role,
} from '@/features/auth/utils/permissions';

export type SidebarBadgeSource = 'new-leads' | 'pending-bookings' | 'pending-reviews' | 'unread-notifications';

export interface NavItem {
  id: string;
  labelKey: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  badgeVariant?: 'default' | 'red';
  badgeSource?: SidebarBadgeSource;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const ALL_STAFF_ITEMS: Record<string, NavItem> = {
  dashboard: {
    id: 'dashboard',
    labelKey: 'nav.dashboard',
    label: 'Bảng điều khiển',
    icon: LayoutDashboard,
    href: '/staff/dashboard',
  },
  crm: {
    id: 'crm',
    labelKey: 'nav.crm',
    label: 'Quản lý Lead / CRM',
    icon: Users,
    href: '/staff/crm',
    badgeSource: 'new-leads',
    badgeVariant: 'red',
  },
  bookings: {
    id: 'bookings',
    labelKey: 'nav.bookings',
    label: 'Lịch hẹn & Booking',
    icon: CalendarCheck,
    href: '/staff/bookings',
  },
  reviews: {
    id: 'reviews',
    labelKey: 'nav.reviews',
    label: 'Đánh giá khách hàng',
    icon: Star,
    href: '/staff/reviews',
  },
  blog: {
    id: 'blog',
    labelKey: 'nav.blog',
    label: 'Bài viết & Blog',
    icon: Newspaper,
    href: '/staff/blog',
  },
  notifications: {
    id: 'notifications',
    labelKey: 'nav.notifications',
    label: 'Thông báo',
    icon: Bell,
    href: '/staff/notifications',
  },
  settings: {
    id: 'settings',
    labelKey: 'nav.settings',
    label: 'Cài đặt',
    icon: Settings,
    href: '/staff/settings',
  },
};

export function getStaffNavSections(role: Role): NavSection[] {
  const allowedIds = ROLE_NAV_CONFIG[role] ?? [];

  const workItems: NavItem[] = [];
  const personalItems: NavItem[] = [];

  // Work items: dashboard + business-related
  const workNavIds = ['dashboard', 'crm', 'bookings', 'reviews', 'blog'];
  workNavIds.forEach((id) => {
    if (allowedIds.includes(id) && ALL_STAFF_ITEMS[id]) {
      workItems.push(ALL_STAFF_ITEMS[id]);
    }
  });

  // Personal items: notifications + settings
  personalItems.push(ALL_STAFF_ITEMS.notifications);
  personalItems.push(ALL_STAFF_ITEMS.settings);

  const sections: NavSection[] = [];
  if (workItems.length > 0) {
    sections.push({ label: 'sections.work', items: workItems });
  }
  if (personalItems.length > 0) {
    sections.push({ label: 'sections.personal', items: personalItems });
  }

  return sections;
}

export function getNavItemByHref(href: string): NavItem | undefined {
  for (const item of Object.values(ALL_STAFF_ITEMS)) {
    if (href.startsWith(item.href)) {
      return item;
    }
  }
  return undefined;
}

export { RoleDisplayNames };
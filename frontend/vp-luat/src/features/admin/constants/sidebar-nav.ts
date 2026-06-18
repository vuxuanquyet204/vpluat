import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Newspaper,
  Gavel,
  Star,
  Bot,
  Mail,
  UserCog,
  Settings,
  LayoutTemplate,
  Bell,
  History,
} from 'lucide-react';

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
  permission?: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    label: 'Quản lý',
    items: [
      {
        id: 'dashboard',
        labelKey: 'nav.dashboard',
        label: 'Bảng điều khiển',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
      },
      {
        id: 'bookings',
        labelKey: 'nav.bookings',
        label: 'Lịch hẹn & Booking',
        icon: CalendarCheck,
        href: '/admin/bookings',
      },
      {
        id: 'crm',
        labelKey: 'nav.crm',
        label: 'Quản lý Lead / CRM',
        icon: Users,
        href: '/admin/crm',
        badgeSource: 'new-leads',
        badgeVariant: 'red',
      },
      {
        id: 'blog',
        labelKey: 'nav.blog',
        label: 'Bài viết & Blog',
        icon: Newspaper,
        href: '/admin/blog',
      },
      {
        id: 'services',
        labelKey: 'nav.services',
        label: 'Dịch vụ & Luật sư',
        icon: Gavel,
        href: '/admin/services-management',
      },
      {
        id: 'reviews',
        labelKey: 'nav.reviews',
        label: 'Đánh giá khách hàng',
        icon: Star,
        href: '/admin/reviews',
      },
      {
        id: 'chatbot',
        labelKey: 'nav.chatbot',
        label: 'Chatbot Logs',
        icon: Bot,
        href: '/admin/chatbot',
      },
      {
        id: 'newsletter',
        labelKey: 'nav.newsletter',
        label: 'Newsletter',
        icon: Mail,
        href: '/admin/newsletter',
      },
      {
        id: 'landing-pages',
        labelKey: 'nav.landing_pages',
        label: 'Landing Pages',
        icon: LayoutTemplate,
        href: '/admin/landing-pages',
      },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      {
        id: 'users',
        labelKey: 'nav.users',
        label: 'Người dùng & Phân quyền',
        icon: UserCog,
        href: '/admin/users',
      },
      {
        id: 'notifications',
        labelKey: 'nav.notifications',
        label: 'Thông báo',
        icon: Bell,
        href: '/admin/notifications',
      },
      {
        id: 'audit',
        labelKey: 'nav.audit',
        label: 'Audit log',
        icon: History,
        href: '/admin/audit',
      },
      {
        id: 'settings',
        labelKey: 'nav.settings',
        label: 'Cài đặt hệ thống',
        icon: Settings,
        href: '/admin/settings',
      },
    ],
  },
];

export const getNavItemByHref = (href: string): NavItem | undefined => {
  for (const section of ADMIN_NAV_SECTIONS) {
    const item = section.items.find((i) => i.href === href);
    if (item) return item;
  }
  return undefined;
};

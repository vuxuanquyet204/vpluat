'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dịch vụ', href: '/services' },
  { label: 'Luật sư', href: '/lawyers' },
  { label: 'Tin tức', href: '/news' },
  { label: 'Liên hệ', href: '/contact' },
];

interface NavLinksProps {
  layout?: 'desktop' | 'mobile';
  onItemClick?: () => void;
  className?: string;
}

export function NavLinks({ layout = 'desktop', onItemClick, className }: NavLinksProps) {
  const pathname = usePathname();
  const isDesktop = layout === 'desktop';

  if (isDesktop) {
    return (
      <ul className={cn('navbar__menu', className)}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <li key={item.href} className="navbar__menu-item">
              <Link
                href={item.href}
                className={cn('navbar__menu-link', isActive && 'navbar__menu-link--active')}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={className}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('mobile-menu__link', isActive && 'mobile-menu__link--active')}
            onClick={onItemClick}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

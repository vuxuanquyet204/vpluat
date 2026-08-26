'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'lawyers', href: '/lawyers' },
  { key: 'news', href: '/news' },
  { key: 'contact', href: '/contact' },
] as const;

interface NavLinksProps {
  layout?: 'desktop' | 'mobile';
  onItemClick?: () => void;
  className?: string;
}

export function NavLinks({ layout = 'desktop', onItemClick, className }: NavLinksProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const isDesktop = layout === 'desktop';

  const links = NAV_ITEMS.map((item) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
    return {
      ...item,
      label: t(item.key),
      isActive,
    };
  });

  if (isDesktop) {
    return (
      <ul className={cn('navbar__menu', className)}>
        {links.map((item) => (
          <li key={item.href} className="navbar__menu-item">
            <Link
              href={item.href}
              className={cn('navbar__menu-link', item.isActive && 'navbar__menu-link--active')}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={className}>
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn('mobile-menu__link', item.isActive && 'mobile-menu__link--active')}
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

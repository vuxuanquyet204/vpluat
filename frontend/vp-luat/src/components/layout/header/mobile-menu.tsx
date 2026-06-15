'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/ui.store';
import { NavLinks } from './nav-links';
import { LanguageSwitcher } from './language-switcher';

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  // Lock body scroll when open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
      <NavLinks layout="mobile" onItemClick={handleLinkClick} />
      <div className="mobile-menu__divider" />
      <LanguageSwitcher layout="mobile" />
      <Link href="/booking" className="mobile-menu__cta" onClick={handleLinkClick}>
        Đặt lịch tư vấn
      </Link>
    </div>
  );
}

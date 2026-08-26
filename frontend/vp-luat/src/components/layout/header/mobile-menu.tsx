'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/stores/ui.store';
import { NavLinks } from './nav-links';
import { LanguageSwitcher } from './language-switcher';

export function MobileMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const t = useTranslations('header');
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  // Close on Escape + simple focus trap
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handler);

    // Move focus into the menu when it opens.
    const focusTimeout = window.setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (focusable[0] ?? container).focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handler);
      window.clearTimeout(focusTimeout);
      previousFocus?.focus?.();
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleLinkClick = () => setMobileMenuOpen(false);

  return (
    <div
      ref={containerRef}
      className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}
      role="dialog"
      aria-modal={mobileMenuOpen ? true : undefined}
      aria-label={t('navigationMenu')}
      aria-hidden={!mobileMenuOpen}
      tabIndex={-1}
    >
      <NavLinks layout="mobile" onItemClick={handleLinkClick} />
      <div className="mobile-menu__divider" />
      <LanguageSwitcher layout="mobile" />
      <Link href="/booking" className="mobile-menu__cta" onClick={handleLinkClick}>
        {t('bookConsultation')}
      </Link>
    </div>
  );
}

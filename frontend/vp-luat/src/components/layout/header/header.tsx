'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { NavLinks } from './nav-links';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';

const HIDDEN_PREFIXES = ['/admin', '/login', '/landing-builder'];

function shouldHide(pathname: string | null) {
  if (!pathname) return false;
  return HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const pathname = usePathname();
  const hidden = shouldHide(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hidden) return null;

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <div className="navbar__logo-icon">VP</div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-name">VP Luật Hùng & Cộng sự</span>
              <span className="navbar__logo-sub">Law Firm</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <NavLinks layout="desktop" />

          {/* Actions */}
          <div className="navbar__actions">
            <LanguageSwitcher layout="desktop" />
            <Link href="/booking" className="navbar__cta">
              Đặt lịch tư vấn
            </Link>
            <button
              className={`navbar__hamburger ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}

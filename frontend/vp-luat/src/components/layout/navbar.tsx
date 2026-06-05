'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/ui.store';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Dịch vụ', href: '/dich-vu' },
  { label: 'Luật sư', href: '/luat-su' },
  { label: 'Blog', href: '/blog' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Liên hệ', href: '/lien-he' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on link
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
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
        <ul className="navbar__menu">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="navbar__menu-item">
              <Link href={item.href} className="navbar__menu-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          <div className="navbar__lang">
            <button className="navbar__lang-btn active">VI</button>
            <button className="navbar__lang-btn">EN</button>
          </div>
          <Link href="/lien-he" className="navbar__cta">
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

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mobile-menu__link"
            onClick={handleLinkClick}
          >
            {item.label}
          </Link>
        ))}
        <div className="mobile-menu__divider" />
        <Link
          href="/lien-he"
          className="mobile-menu__cta"
          onClick={handleLinkClick}
        >
          Đặt lịch tư vấn
        </Link>
      </div>
    </nav>
  );
}

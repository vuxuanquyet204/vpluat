'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FooterBrand, FooterColumns } from './footer-columns';

export function Footer() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith('/admin') ?? false;
  if (hidden) return null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <FooterBrand />
          <FooterColumns />
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} VP Luật Hùng & Cộng sự. Giữ bản quyền.
          </p>
          <div className="footer__legal">
            <Link href="/contact">Chính sách bảo mật</Link>
            <Link href="/contact">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { BackToTop } from './back-to-top';

export function FloatingWidgets() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <div className="floating-widgets" aria-label="Tiện ích nhanh">
      <BackToTop />
    </div>
  );
}

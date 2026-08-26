'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BackToTop } from './back-to-top';

export function FloatingWidgets() {
  const t = useTranslations('chatbot');
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <div className="floating-widgets" aria-label={t('widgetsLabel')}>
      <BackToTop />
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export function ContactMap() {
  const t = useTranslations('public.contactHero');
  const { data: siteContent } = usePublicSiteContent();
  const address = siteContent?.contact.address ?? '';
  if (!address) return null;
  return <div className="contact-map"><iframe src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=vi&z=16&output=embed`} width="100%" height="380" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={t('contact')} /></div>;
}

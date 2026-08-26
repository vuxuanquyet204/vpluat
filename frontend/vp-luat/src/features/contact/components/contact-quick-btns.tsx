'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PublicSiteContent } from '@/features/home/api/site-content-api';

export function ContactQuickBtns({ contact }: { contact: PublicSiteContent['contact'] }) {
  const t = useTranslations('contactPage.quick');
  return <div className="contact-quick-btns"><a href={contact.hotline ? `tel:${contact.hotline.replace(/\s/g, '')}` : undefined} className="contact-quick-btn contact-quick-btn--phone"><Phone size={17} />{t('call')}</a>{contact.zaloUrl && <a href={contact.zaloUrl} target="_blank" rel="noopener noreferrer" className="contact-quick-btn contact-quick-btn--zalo"><MessageCircle size={17} />Zalo</a>}</div>;
}

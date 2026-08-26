'use client';

import { useTranslations } from 'next-intl';
import type { PublicSiteContent } from '@/features/home/api/site-content-api';

export function ContactOffices({ offices }: { offices: PublicSiteContent['offices'] }) {
  const t = useTranslations('contactPage.offices');
  if (offices.length === 0) return null;
  return <section className="contact-offices-section"><div className="container"><div className="section__header"><div className="section__label">{t('label')}</div><h2 className="section__title">{t('title')}</h2></div><div className="contact-offices-grid">{offices.map((office) => <article className="contact-office-card" key={`${office.city}-${office.address}`}><h3>{office.city}{office.isMain ? ` · ${t('mainBadge')}` : ''}</h3><p>{office.address}</p><p>{office.phone}</p><p>{office.email}</p><p>{office.workingHours}</p></article>)}</div></div></section>;
}

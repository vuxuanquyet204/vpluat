'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PublicSiteContent } from '@/features/home/api/site-content-api';
import { useTranslations } from 'next-intl';

export function ContactFaq({ faqs }: { faqs: PublicSiteContent['faqs'] }) {
  const t = useTranslations('contactPage.faq');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  if (faqs.length === 0) return null;
  return <section className="contact-faq-section"><div className="container"><div className="section__header"><div className="section__label">{t('label')}</div><h2 className="section__title">{t('title')}</h2></div><div className="services-faq-list">{faqs.map((faq) => { const open = openId === faq.id; return <div key={faq.id} className={`services-faq-item ${open ? 'active' : ''}`}><button type="button" className="services-faq-question" onClick={() => setOpenId(open ? null : faq.id)} aria-expanded={open}><span>{faq.question}</span><Plus size={20} /></button><div className="services-faq-answer" hidden={!open}><p>{faq.answer}</p></div></div>; })}</div></div></section>;
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export function ServicesFaq() {
  const t = useTranslations('public.services.faq');
  const { data: siteContent } = usePublicSiteContent();
  const faqs = (siteContent?.faqs ?? []).map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }));
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="services-faq-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">{t('label')}</div>
          <h2 className="section__title">{t('title')}</h2>
          <p className="section__subtitle">{t('subtitle')}</p>
        </div>

        <div className="services-faq-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className={`services-faq-item ${isOpen ? 'active' : ''}`}>
                <button
                  type="button"
                  className="services-faq-question"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <Plus size={20} className="services-faq-icon" aria-hidden="true" />
                </button>
                <div className="services-faq-answer" hidden={!isOpen}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

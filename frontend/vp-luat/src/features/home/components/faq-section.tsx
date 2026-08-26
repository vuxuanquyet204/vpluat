'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqId = useId();
  const t = useTranslations('homeSections.faq');
  const { data: siteContent, isLoading } = usePublicSiteContent();
  const faqs = siteContent?.faqs ?? [];

  return (
    <section className="section section--gray">
      <div className="container">
        <div className="section__header">
          <span className="section__label">{t('label')}</span>
          <h2 className="section__title">{t('title')}</h2>
          <p className="section__subtitle">{t('subtitle')}</p>
        </div>
        <div className="faq__container">
          {isLoading && <p>{t('loading')}</p>}
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `${faqId}-answer-${index}`;
            return (
              <div key={`${faq.question}-${index}`} className={`faq-item ${isOpen ? 'active' : ''}`}>
                <button className="faq-item__question" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={answerId}>
                  <span>{faq.question}</span><Plus className="faq-item__icon" size={16} />
                </button>
                <div id={answerId} className={`faq-item__answer ${isOpen ? 'active' : ''}`}>
                  <div className="faq-item__answer-inner">{faq.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { ContactHero } from '../../components/contact-hero';
import { ContactInfoList } from '../../components/contact-info-list';
import { ContactQuickBtns } from '../../components/contact-quick-btns';
import { ContactForm } from '../../components/contact-form';
import { ContactMap } from '../../components/contact-map';
import { ContactFaq } from '../../components/contact-faq';
import { ContactOffices } from '../../components/contact-offices';
import type { ContactFormValues } from '../../types';
import { submitContactMessage } from '../../api/contact-api';
import { useTranslations } from 'next-intl';
import { usePublicSiteContent } from '@/features/home/hooks/use-site-content';

export default function ContactPage() {
  const t = useTranslations('public.contact');
  const { data: siteContent } = usePublicSiteContent();
  const handleSubmit = async (values: ContactFormValues) => {
    await submitContactMessage(values, 'contact-page');
  };

  return (
    <>
      <ContactHero />

      <section className="contact-section">
        <div className="contact-grid">
          <div>
            <ContactInfoList contact={siteContent?.contact ?? { hotline: '', email: '', address: '', workingHours: '', zaloUrl: '' }} />
            <ContactQuickBtns contact={siteContent?.contact ?? { hotline: '', email: '', address: '', workingHours: '', zaloUrl: '' }} />
          </div>
          <div className="contact-form-wrapper">
            <h2 className="contact-form__title">
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              {t('formTitle')}
            </h2>
            <p className="contact-form__sub">
              {t('formSubtitle')}
            </p>
            <ContactForm onSubmit={handleSubmit} />
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="container">
          <ContactMap />
        </div>
      </section>

      <ContactFaq faqs={siteContent?.faqs ?? []} />
      <ContactOffices offices={siteContent?.offices ?? []} />
    </>
  );
}

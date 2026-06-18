'use client';

import { ContactHero } from '../../components/contact-hero';
import { ContactInfoList } from '../../components/contact-info-list';
import { ContactQuickBtns } from '../../components/contact-quick-btns';
import { ContactForm } from '../../components/contact-form';
import { ContactMap } from '../../components/contact-map';
import { ContactFaq } from '../../components/contact-faq';
import { ContactOffices } from '../../components/contact-offices';
import type { ContactFormValues } from '../../types';

export default function ContactPage() {
  const handleSubmit = async (values: ContactFormValues) => {
    if (typeof window !== 'undefined') {
      console.info('[contact] submitted', values);
    }
  };

  return (
    <>
      <ContactHero />

      <section className="contact-section">
        <div className="contact-grid">
          <div>
            <ContactInfoList />
            <ContactQuickBtns />
          </div>
          <div className="contact-form-wrapper">
            <h2 className="contact-form__title">
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              Gửi yêu cầu tư vấn
            </h2>
            <p className="contact-form__sub">
              Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong vòng 30 phút.
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

      <ContactFaq />
      <ContactOffices />
    </>
  );
}

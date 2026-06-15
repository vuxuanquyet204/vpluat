'use client';

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
      <section className="page-header contact-page-header">
        <div className="container">
          <div className="page-header__inner">
            <div className="page-header__label">
              <i className="fa-solid fa-headset" aria-hidden="true" />
              Liên hệ với chúng tôi
            </div>
            <h1 className="page-header__title">
              Hỗ trợ pháp lý <em>24/7</em>
            </h1>
            <p className="page-header__sub">
              Đội ngũ luật sư sẵn sàng lắng nghe và hỗ trợ bạn giải quyết mọi vấn đề pháp lý.
              Buổi tư vấn đầu tiên hoàn toàn miễn phí.
            </p>
          </div>
        </div>
      </section>

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

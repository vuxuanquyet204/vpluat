'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CONTACT_FAQS } from '../lib/data/contact-data';

export function ContactFaq() {
  const [openId, setOpenId] = useState<string | null>(CONTACT_FAQS[0]?.id ?? null);

  return (
    <section className="contact-faq-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">Câu hỏi thường gặp</div>
          <h2 className="section__title">Giải đáp nhanh</h2>
        </div>

        <div className="services-faq-list">
          {CONTACT_FAQS.map((faq) => {
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

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SERVICES_FAQS } from '../lib/data/services-data';

export function ServicesFaq() {
  const [openId, setOpenId] = useState<string | null>(SERVICES_FAQS[0]?.id ?? null);

  return (
    <section className="services-faq-section">
      <div className="container">
        <div className="section__header">
          <div className="section__label">Câu hỏi thường gặp</div>
          <h2 className="section__title">Giải đáp thắc mắc</h2>
          <p className="section__subtitle">
            Những câu hỏi phổ biến nhất từ khách hàng khi sử dụng dịch vụ của chúng tôi.
          </p>
        </div>

        <div className="services-faq-list">
          {SERVICES_FAQS.map((faq) => {
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

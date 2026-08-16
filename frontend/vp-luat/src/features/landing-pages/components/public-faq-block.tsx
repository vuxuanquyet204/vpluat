'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

export interface FaqBlockItem {
  question: string;
  answer: string;
}

export function PublicFaqBlock({ title, items }: { title: string; items: FaqBlockItem[] }) {
  // Open the first item by default so users see the section has content.
  // The rest start collapsed and can be toggled independently.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (items.length === 0) return null;

  return (
    <section className="section section--gray">
      <div className="container">
        <div className="section__header">
          <h2 className="section__title">{title}</h2>
        </div>
        <div className="faq__container">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `public-faq-panel-${idx}`;
            const buttonId = `public-faq-button-${idx}`;
            return (
              <article
                key={item.question}
                className={`faq-item public-faq-item ${isOpen ? 'active' : ''}`}
              >
                <h3 className="faq-item__question public-faq-item__question">
                  <button
                    id={buttonId}
                    type="button"
                    className="faq-item__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span>{item.question}</span>
                    <Plus
                      className={`faq-item__icon ${isOpen ? 'faq-item__icon--open' : ''}`}
                      aria-hidden="true"
                      size={18}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`faq-item__answer ${isOpen ? 'active' : ''}`}
                  hidden={!isOpen}
                >
                  <div className="faq-item__answer-inner">{item.answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

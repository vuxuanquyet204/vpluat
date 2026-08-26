'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, HelpCircle, ThumbsUp } from 'lucide-react';
import type { FaqSuggestion } from '../types';

interface ChatFaqSuggestionsProps {
  items: FaqSuggestion[];
  onPick?: (item: FaqSuggestion) => void;
}

export function ChatFaqSuggestions({ items, onPick }: ChatFaqSuggestionsProps) {
  const t = useTranslations('chatbot');
  const [openId, setOpenId] = useState<string | null>(null);

  if (!items?.length) return null;

  return (
    <div className="chat-faq-suggestions" aria-label={t('faqLabel')}>
      <div className="chat-faq-suggestions__header">
        <HelpCircle size={12} aria-hidden="true" />
        <span>{t('faqHeader')}</span>
      </div>
      <ul className="chat-faq-suggestions__list">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <li key={item.id} className="chat-faq-suggestion">
              <button
                type="button"
                className="chat-faq-suggestion__trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="chat-faq-suggestion__question">{item.question}</span>
                {isOpen ? (
                  <ChevronUp size={14} aria-hidden="true" />
                ) : (
                  <ChevronDown size={14} aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <div className="chat-faq-suggestion__body">
                  {item.answer ? (
                    <p>{item.answer}</p>
                  ) : (
                    <p className="chat-faq-suggestion__empty">
                      ({t('faqNoAnswer')})
                    </p>
                  )}
                  {onPick && (
                    <button
                      type="button"
                      className="chat-faq-suggestion__cta"
                      onClick={() => onPick(item)}
                    >
                      <ThumbsUp size={11} /> {t('faqAskSimilar')}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
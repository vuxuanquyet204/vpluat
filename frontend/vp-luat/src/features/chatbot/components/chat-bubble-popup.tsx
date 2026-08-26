'use client';

import { useTranslations } from 'next-intl';

interface ChatBubblePopupProps {
  onClose: () => void;
  onOpen: () => void;
}

export function ChatBubblePopup({ onClose, onOpen }: ChatBubblePopupProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="bubble-popup" role="dialog" aria-label={t('popupLabel')}>
      <div className="bubble-popup__arrow" />
      <p className="bubble-popup__text">
        {t('popupMessage')}
      </p>
      <button
        className="bubble-popup__close"
        onClick={onClose}
        aria-label={t('dismissPopup')}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button className="bubble-popup__action" onClick={onOpen}>
        {t('startChat')}
      </button>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import type { QuickReply } from '../types';

interface ChatQuickRepliesProps {
  quickReplies: QuickReply[];
  onSelect: (reply: string) => void;
}

export function ChatQuickReplies({ quickReplies, onSelect }: ChatQuickRepliesProps) {
  const t = useTranslations('chatbot');

  return (
    <div className="quick-replies" role="group" aria-label={t('quickRepliesLabel')}>
      {quickReplies.map((qr, i) => (
        <button
          key={i}
          className="quick-reply"
          onClick={() => onSelect(qr.reply)}
          aria-label={qr.label}
        >
          {qr.icon && (
            <i
              className={qr.icon}
              style={{ fontSize: '0.68rem', marginRight: '4px' }}
              aria-hidden="true"
            />
          )}
          {qr.label}
        </button>
      ))}
    </div>
  );
}

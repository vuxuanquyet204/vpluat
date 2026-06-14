'use client';

import type { QuickReply } from '../types';

interface ChatQuickRepliesProps {
  quickReplies: QuickReply[];
  onSelect: (reply: string) => void;
}

export function ChatQuickReplies({ quickReplies, onSelect }: ChatQuickRepliesProps) {
  return (
    <div className="quick-replies" role="group" aria-label="Chọn nhanh">
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

'use client';

import type { ChatMessage } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isBot = message.from === 'bot';
  const isUser = message.from === 'user';

  return (
    <div className={`msg msg--${message.from}`}>
      {isBot && (
        <div className="msg__avatar msg__avatar--bot" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 8V4H8" />
            <rect x="3" y="8" width="14" height="12" rx="2" />
            <circle cx="9" cy="13" r="1" fill="white" />
            <circle cx="12" cy="13" r="1" fill="white" />
            <circle cx="15" cy="13" r="1" fill="white" />
          </svg>
        </div>
      )}

      <div className="msg__content">
        {isUser && (
          <span className="msg__time">{formatTime(message.timestamp)}</span>
        )}
        <div
          className={`msg__bubble ${isUser ? 'msg__bubble--user' : 'msg__bubble--bot'}`}
          style={isBot && message.disclaimer ? { paddingBottom: '2px' } : undefined}
        >
          {isBot && message.disclaimer && (
            <div
              className="msg__disclaimer"
              dangerouslySetInnerHTML={{
                __html: `<i class="fa-solid fa-triangle-exclamation"></i> ${message.disclaimer}`,
              }}
            />
          )}
          <div
            className="msg__text"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        </div>
        {isBot && (
          <span className="msg__time">{formatTime(message.timestamp)}</span>
        )}
      </div>

      {isUser && (
        <div className="msg__avatar msg__avatar--user" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

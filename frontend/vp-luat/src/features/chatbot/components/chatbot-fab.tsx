'use client';

import { useChatbotWidget } from '../hooks';
import { MessageCircle } from 'lucide-react';

export function ChatbotFab() {
  const { isOpen, unreadCount, toggleOpen } = useChatbotWidget();

  return (
    <button
      onClick={toggleOpen}
      className="chatbot__fab"
      aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <MessageCircle size={26} strokeWidth={1.5} />
      )}

      {!isOpen && unreadCount > 0 && (
        <span className="chatbot__fab-badge" aria-label={`${unreadCount} tin nhắn mới`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

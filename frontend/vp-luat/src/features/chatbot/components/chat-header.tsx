'use client';

import { useChatbotWidget } from '../hooks';
import { CHATBOT_CONFIG } from '../config';

export function ChatHeader() {
  const { setOpen, setMinimized } = useChatbotWidget();

  return (
    <div className="chat-header">
      <div className="chat-header__avatar">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 8V4H8" />
          <rect x="3" y="8" width="14" height="12" rx="2" />
          <circle cx="9" cy="13" r="1" fill="white" />
          <circle cx="12" cy="13" r="1" fill="white" />
          <circle cx="15" cy="13" r="1" fill="white" />
        </svg>
        <span className="chat-header__status" aria-label="Trực tuyến" />
      </div>

      <div className="chat-header__info">
        <span className="chat-header__name">{CHATBOT_CONFIG.BOT_NAME}</span>
        <span className="chat-header__subtitle">{CHATBOT_CONFIG.BOT_SUBTITLE}</span>
      </div>

      <div className="chat-header__actions">
        <button
          className="chat-header__btn"
          onClick={() => setMinimized(true)}
          aria-label="Thu nhỏ"
          title="Thu nhỏ"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          className="chat-header__btn"
          onClick={() => setOpen(false)}
          aria-label="Đóng"
          title="Đóng"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

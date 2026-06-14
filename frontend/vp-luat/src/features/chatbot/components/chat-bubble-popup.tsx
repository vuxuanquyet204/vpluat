'use client';

interface ChatBubblePopupProps {
  onClose: () => void;
  onOpen: () => void;
}

export function ChatBubblePopup({ onClose, onOpen }: ChatBubblePopupProps) {
  return (
    <div className="bubble-popup" role="dialog" aria-label="Chatbot thông báo">
      <div className="bubble-popup__arrow" />
      <p className="bubble-popup__text">
        Xin chào! Tôi có thể giúp gì cho bạn?
      </p>
      <button
        className="bubble-popup__close"
        onClick={onClose}
        aria-label="Đóng thông báo"
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
        Bắt đầu chat
      </button>
    </div>
  );
}

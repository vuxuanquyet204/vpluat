'use client';

export function ChatTypingIndicator() {
  return (
    <div className="msg msg--bot" aria-label="Bot đang nhập">
      <div className="msg__avatar msg__avatar--bot" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
          <path d="M12 8V4H8" />
          <rect x="3" y="8" width="14" height="12" rx="2" />
          <circle cx="9" cy="13" r="1" fill="white" />
          <circle cx="12" cy="13" r="1" fill="white" />
          <circle cx="15" cy="13" r="1" fill="white" />
        </svg>
      </div>
      <div className="msg__content">
        <div className="msg__bubble msg__bubble--bot typing-indicator">
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
          <span className="typing-indicator__dot" />
        </div>
      </div>
    </div>
  );
}

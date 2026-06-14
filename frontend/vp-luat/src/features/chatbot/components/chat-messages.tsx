'use client';

import { useRef, useEffect } from 'react';
import { useChatbotStore } from '../state';
import { ChatMessageItem } from './chat-message-item';
import { ChatTypingIndicator } from './chat-typing-indicator';

export function ChatMessages() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = useChatbotStore((s) => s.messages);
  const streamedContent = useChatbotStore((s) => s.streamedContent);
  const isStreaming = useChatbotStore((s) => s.isStreaming);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamedContent.length]);

  return (
    <div className="chat-messages" role="log" aria-live="polite" aria-label="Tin nhắn chatbot">
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {(isStreaming || streamedContent) && (
        <div className="msg msg--bot">
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
            <div className="msg__bubble msg__bubble--bot msg__bubble--streaming">
              <div
                className="msg__text"
                dangerouslySetInnerHTML={{ __html: streamedContent || '' }}
              />
            </div>
          </div>
        </div>
      )}

      {isStreaming && !streamedContent && <ChatTypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}

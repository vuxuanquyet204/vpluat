'use client';

import { useChatbotStore } from '../state';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInputArea } from './chat-input-area';
import { ChatHandoffBanner } from './chat-handoff-banner';

export function ChatWindow() {
  const isMinimized = useChatbotStore((s) => s.isMinimized);
  const conversationState = useChatbotStore((s) => s.conversationState);

  if (isMinimized) return null;

  return (
    <div
      className="chat-window"
      role="dialog"
      aria-label="Cửa sổ chat AI"
      aria-modal="false"
    >
      <ChatHeader />

      <div className="chat-window__body">
        <ChatMessages />

        {(conversationState === 'lead_complete' || conversationState === 'handoff_booking') && (
          <ChatHandoffBanner />
        )}
      </div>

      <ChatInputArea />
    </div>
  );
}

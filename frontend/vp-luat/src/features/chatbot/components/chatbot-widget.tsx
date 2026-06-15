'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useChatbotWidget } from '../hooks';
import { ChatbotFab } from './chatbot-fab';
import { ChatWindow } from './chat-window';
import { ChatBubblePopup } from './chat-bubble-popup';

export function ChatbotWidget() {
  const { isOpen, popupDismissed, toggleOpen, dismissPopup, setOpen } = useChatbotWidget();
  const hasInitialized = useRef(false);
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  // Check sessionStorage on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      const stored = sessionStorage.getItem('chatbot-v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If user has seen popup before, skip it
        if (parsed.state?.hasSeenPopup) {
          useChatbotWidget();
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <>
      {/* Bubble Popup — shows 3s after page load if not dismissed */}
      {!isOpen && !popupDismissed && (
        <ChatBubblePopup onClose={dismissPopup} onOpen={() => setOpen(true)} />
      )}

      {/* Chat Window */}
      <div
        className={`chatbot-widget ${isOpen ? 'chatbot-widget--open' : ''}`}
        aria-live="off"
      >
        <ChatWindow />
      </div>

      {/* FAB */}
      <ChatbotFab />
    </>
  );
}

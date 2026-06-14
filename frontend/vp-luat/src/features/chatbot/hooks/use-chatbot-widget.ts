'use client';

import { useEffect } from 'react';
import { useChatbotStore } from '../state';
import { GREETING_MESSAGE } from '../config/conversation-flow';
import { CHATBOT_CONFIG } from '../config';

export function useChatbotWidget() {
  const {
    isOpen,
    isMinimized,
    popupDismissed,
    hasSeenPopup,
    messages,
    unreadCount,
    setOpen,
    toggleOpen,
    setMinimized,
    dismissPopup,
    addMessage,
    setConversationState,
    resetAll,
  } = useChatbotStore();

  // Show greeting message when chatbot opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasSeenPopup) {
      addMessage(GREETING_MESSAGE);
      setConversationState('greeting');
    }
  }, [isOpen, messages.length, hasSeenPopup, addMessage, setConversationState]);

  // Popup timer
  useEffect(() => {
    if (popupDismissed || hasSeenPopup || isOpen) return;

    const timer = setTimeout(() => {
      useChatbotStore.getState().dismissPopup();
    }, CHATBOT_CONFIG.POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [popupDismissed, hasSeenPopup, isOpen]);

  return {
    isOpen,
    isMinimized,
    popupDismissed,
    unreadCount,
    toggleOpen,
    dismissPopup,
    setOpen,
    setMinimized,
    resetAll,
  };
}

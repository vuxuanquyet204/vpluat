'use client';

import { useEffect } from 'react';
import { getSessionHistory } from '../api/chatbot-api';
import { useChatbotStore } from '../state';
import type { ChatMessage } from '../types';
import { createConversationFlow } from '../config/conversation-flow';
import { CHATBOT_CONFIG } from '../config';
import { useTranslations } from 'next-intl';

export function useChatbotWidget() {
  const t = useTranslations('chatbot');
  const {
    isOpen,
    isMinimized,
    popupDismissed,
    hasSeenPopup,
    messages,
    sessionId,
    unreadCount,
    setMessages,
    setOpen,
    toggleOpen,
    setMinimized,
    dismissPopup,
    addMessage,
    setConversationState,
    resetAll,
  } = useChatbotStore();

  useEffect(() => {
    if (!isOpen || !sessionId || messages.length > 0) return;

    let cancelled = false;
    void getSessionHistory(sessionId).then((history) => {
      if (cancelled || history.length === 0) return;
      const restoredMessages: ChatMessage[] = history.map((item, index) => ({
        id: `history-${sessionId}-${index}`,
        from: item.role === 'USER' ? 'user' : item.role === 'SYSTEM' ? 'system' : 'bot',
        content: item.content ?? '',
        timestamp: item.timestamp ?? new Date().toISOString(),
      }));
      setMessages(restoredMessages);
    }).catch(() => {
      // A stale session should not prevent the widget from opening.
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionId, messages.length, setMessages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasSeenPopup && !sessionId) {
      addMessage(createConversationFlow(t).greetingMessage);
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

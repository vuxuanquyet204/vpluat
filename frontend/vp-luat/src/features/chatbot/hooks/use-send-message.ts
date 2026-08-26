'use client';

import { useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useChatbotStore } from '../state';
import { processUserInput } from '../config/conversation-flow';
import { makeUser } from '../config/conversation-flow';
import { sendMessage } from '../api';

export function useSendMessage() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const abortRef = useRef<AbortController | null>(null);
  const {
    sessionId,
    conversationState,
    setError,
    addMessage,
    appendStreamContent,
    finishStream,
  } = useChatbotStore();

  const send = useCallback(
    async (userText: string) => {
      if (!userText || !userText.trim()) return;
      if (abortRef.current) {
        abortRef.current.abort();
      }

      // Handoff: client-side redirect to booking prefill flow. The user
      // message is intentionally NOT sent to /api/chatbot/message because
      // `handoff:...` is a frontend-only protocol string, not a real query.
      if (userText.startsWith('handoff:')) {
        const [, name, phone] = userText.split(':');
        window.location.href =
          `/booking?prefill_name=${encodeURIComponent(name ?? '')}` +
          `&prefill_phone=${encodeURIComponent(phone ?? '')}`;
        return;
      }

      // Always optimistically render the user message in the local store.
      addMessage(makeUser(userText));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendMessage(
          {
            sessionId: sessionId,
            message: userText,
            language: locale,
          },
          appendStreamContent,
          (chunk) => {
            finishStream(chunk.quickReplies, chunk.inputPrompt, chunk.suggestedFaqs);
          },
          controller.signal,
        );

        // Lead collection states are purely a frontend walk-through to
        // validate name/phone format before the user actually triggers an
        // escalation. We append the synthetic bot response locally so the
        // customer keeps moving through the flow; nothing is sent to the
        // backend during these intermediate steps.
        if (conversationState === 'lead_name') {
          const result = processUserInput(t, 'lead_name', userText);
          result.botMessages.forEach((m) => addMessage(m));
        } else if (conversationState === 'lead_phone') {
          const result = processUserInput(t, 'lead_phone', userText);
          result.botMessages.forEach((m) => addMessage(m));
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(
          (err as Error).message ??
            t('networkError'),
        );
      }
    },
    [sessionId, conversationState, locale, addMessage, appendStreamContent, finishStream, setError, t],
  );

  return send;
}

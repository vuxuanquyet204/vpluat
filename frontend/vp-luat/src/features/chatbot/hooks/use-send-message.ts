import { useCallback, useRef } from 'react';
import { useChatbotStore } from '../state';
import { processUserInput } from '../config/conversation-flow';
import { makeUser } from '../config/conversation-flow';
import { sendMessage } from '../api';

export function useSendMessage() {
  const abortRef = useRef<AbortController | null>(null);
  const {
    sessionId,
    conversationState,
    context,
    setError,
    addMessage,
    appendStreamContent,
    finishStream,
  } = useChatbotStore();

  const send = useCallback(
    async (userText: string) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const userMsg = makeUser(userText);
      addMessage(userMsg);

      // Lead collection states — collect name/phone
      if (conversationState === 'lead_name') {
        const result = processUserInput('lead_name', userText);
        result.botMessages.forEach((m) => addMessage(m));
        return;
      }

      if (conversationState === 'lead_phone') {
        const result = processUserInput('lead_phone', userText);
        result.botMessages.forEach((m) => addMessage(m));
        return;
      }

      // Handoff → booking
      if (userText.startsWith('handoff:')) {
        const [, name, phone] = userText.split(':');
        window.location.href = `/booking?prefill_name=${encodeURIComponent(name ?? '')}&prefill_phone=${encodeURIComponent(phone ?? '')}`;
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendMessage(
          {
            sessionId: sessionId ?? 'new',
            message: { from: 'user', content: userText },
            context,
          },
          appendStreamContent,
          (chunk) => {
            finishStream(chunk.quickReplies, chunk.inputPrompt);
          },
          controller.signal,
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(
          (err as Error).message ??
            'Đã xảy ra lỗi. Vui lòng thử lại.',
        );
      }
    },
    [sessionId, conversationState, context, addMessage, appendStreamContent, finishStream, setError],
  );

  return send;
}

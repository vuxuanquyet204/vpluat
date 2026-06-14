'use client';

import { useEffect, useRef } from 'react';
import { useChatbotStore } from '../state';

export function useScrollToBottom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  deps: unknown[],
) {
  const prevLengthRef = useRef(0);
  const isStreaming = useChatbotStore((s) => s.isStreaming);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const { messages, streamedContent } = useChatbotStore.getState();
    const currentLength = messages.length + streamedContent.length;

    if (currentLength !== prevLengthRef.current || isStreaming) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: currentLength === prevLengthRef.current + streamedContent.length
          ? 'auto'
          : 'smooth',
      });
      prevLengthRef.current = currentLength;
    }
  }, [containerRef, ...deps]);

  return null;
}

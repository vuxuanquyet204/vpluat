'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useChatbotStore } from '../state';
import { useSendMessage } from '../hooks';
import { processUserInput } from '../config/conversation-flow';
import { ChatQuickReplies } from './chat-quick-replies';

export function ChatInputArea() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessage = useChatbotStore((s) => s.messages[s.messages.length - 1]);
  const error = useChatbotStore((s) => s.error);
  const isStreaming = useChatbotStore((s) => s.isStreaming);
  const conversationState = useChatbotStore((s) => s.conversationState);
  const setConversationState = useChatbotStore((s) => s.setConversationState);
  const addMessage = useChatbotStore((s) => s.addMessage);
  const sendMsg = useSendMessage();

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [text]);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (conversationState !== 'idle' && conversationState !== 'greeting') {
      const result = processUserInput(conversationState, trimmed);
      result.botMessages.forEach((m) => addMessage(m));
      setConversationState(result.nextState as typeof conversationState);
      return;
    }

    if (conversationState === 'greeting') {
      const result = processUserInput('greeting', trimmed);
      result.botMessages.forEach((m) => addMessage(m));
      setConversationState(result.nextState as typeof conversationState);
      return;
    }

    await sendMsg(trimmed);
  }, [text, isStreaming, conversationState, sendMsg, addMessage, setConversationState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickReply = (reply: string) => {
    const state = conversationState === 'idle' ? 'greeting' : conversationState;
    const result = processUserInput(state, reply);
    result.botMessages.forEach((m) => addMessage(m));
    setConversationState(result.nextState as typeof conversationState);
  };

  return (
    <div className="chat-input-area">
      {lastMessage?.quickReplies && (
        <ChatQuickReplies
          quickReplies={lastMessage.quickReplies}
          onSelect={handleQuickReply}
        />
      )}

      {error && (
        <div className="chat-input-area__error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
          <button onClick={() => useChatbotStore.getState().setError(null)} aria-label="Dismiss error">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div className="chat-input-area__row">
        <textarea
          ref={textareaRef}
          className="chat-input-area__input"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isStreaming}
          aria-label="Nhập tin nhắn"
        />
        <button
          className="chat-input-area__send"
          onClick={handleSubmit}
          disabled={!text.trim() || isStreaming}
          aria-label="Gửi tin nhắn"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="chat-input-area__footer">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
        </svg>
        Powered by AI · Không thay thế tư vấn pháp lý
      </div>
    </div>
  );
}

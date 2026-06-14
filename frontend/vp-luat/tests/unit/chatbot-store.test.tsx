import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatbotStore } from '@/features/chatbot/state';

// Reset store between tests
beforeEach(() => {
  const store = useChatbotStore.getState();
  act(() => {
    store.resetAll();
  });
});

describe('ChatbotStore', () => {
  it('initial state is closed and empty', () => {
    const state = useChatbotStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.messages).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
    expect(state.isStreaming).toBe(false);
    expect(state.error).toBeNull();
  });

  it('toggleOpen flips isOpen', () => {
    const { toggleOpen } = useChatbotStore.getState();

    act(() => toggleOpen());
    expect(useChatbotStore.getState().isOpen).toBe(true);

    act(() => toggleOpen());
    expect(useChatbotStore.getState().isOpen).toBe(false);
  });

  it('setOpen sets isOpen directly', () => {
    const { setOpen } = useChatbotStore.getState();

    act(() => setOpen(true));
    expect(useChatbotStore.getState().isOpen).toBe(true);

    act(() => setOpen(false));
    expect(useChatbotStore.getState().isOpen).toBe(false);
  });

  it('addMessage appends message and increments unread when closed', () => {
    const { addMessage } = useChatbotStore.getState();

    act(() => addMessage({
      id: '1',
      from: 'bot',
      content: 'Xin chào!',
      timestamp: new Date().toISOString(),
    }));

    const state = useChatbotStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].content).toBe('Xin chào!');
    expect(state.unreadCount).toBe(1);
  });

  it('addMessage does NOT increment unread when chat is open', () => {
    const { setOpen, addMessage } = useChatbotStore.getState();

    act(() => setOpen(true));
    act(() => addMessage({
      id: '1',
      from: 'bot',
      content: 'Xin chào!',
      timestamp: new Date().toISOString(),
    }));

    expect(useChatbotStore.getState().unreadCount).toBe(0);
  });

  it('addMessage does NOT increment unread for user messages', () => {
    const { addMessage } = useChatbotStore.getState();

    act(() => addMessage({
      id: '1',
      from: 'user',
      content: 'Tôi cần tư vấn',
      timestamp: new Date().toISOString(),
    }));

    expect(useChatbotStore.getState().unreadCount).toBe(0);
  });

  it('appendStreamContent accumulates streamed text', () => {
    const { appendStreamContent } = useChatbotStore.getState();

    act(() => {
      appendStreamContent('Hello ');
      appendStreamContent('world');
    });

    expect(useChatbotStore.getState().streamedContent).toBe('Hello world');
  });

  it('finishStream creates final bot message and clears stream state', () => {
    const { appendStreamContent, finishStream } = useChatbotStore.getState();

    act(() => appendStreamContent('Đây là phản hồi bot'));
    act(() => finishStream());

    const state = useChatbotStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].from).toBe('bot');
    expect(state.messages[0].content).toBe('Đây là phản hồi bot');
    expect(state.isStreaming).toBe(false);
    expect(state.streamedContent).toBe('');
  });

  it('finishStream does nothing when streamedContent is empty', () => {
    const { finishStream } = useChatbotStore.getState();
    const initialCount = useChatbotStore.getState().messages.length;

    act(() => finishStream());

    expect(useChatbotStore.getState().messages.length).toBe(initialCount);
  });

  it('cancelStream clears streaming state', () => {
    const { appendStreamContent, cancelStream } = useChatbotStore.getState();

    act(() => appendStreamContent('streaming...'));
    act(() => cancelStream());

    const state = useChatbotStore.getState();
    expect(state.isStreaming).toBe(false);
    expect(state.streamedContent).toBe('');
  });

  it('setError sets error and clears streaming', () => {
    const { setError } = useChatbotStore.getState();

    act(() => setError('Network error'));

    const state = useChatbotStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.isStreaming).toBe(false);
  });

  it('dismissPopup sets popupDismissed to true', () => {
    const { dismissPopup } = useChatbotStore.getState();

    act(() => dismissPopup());
    expect(useChatbotStore.getState().popupDismissed).toBe(true);
  });

  it('setConversationState updates state', () => {
    const { setConversationState } = useChatbotStore.getState();

    act(() => setConversationState('greeting'));
    expect(useChatbotStore.getState().conversationState).toBe('greeting');

    act(() => setConversationState('lead_name'));
    expect(useChatbotStore.getState().conversationState).toBe('lead_name');
  });

  it('setContext merges partial context', () => {
    const { setContext } = useChatbotStore.getState();

    act(() => setContext({ userName: 'Nguyễn Văn A' }));
    expect(useChatbotStore.getState().context.userName).toBe('Nguyễn Văn A');

    act(() => setContext({ userPhone: '0912345678' }));
    const state = useChatbotStore.getState();
    expect(state.context.userName).toBe('Nguyễn Văn A');
    expect(state.context.userPhone).toBe('0912345678');
  });

  it('markAsRead resets unreadCount', () => {
    const { addMessage, markAsRead } = useChatbotStore.getState();

    act(() => addMessage({
      id: '1',
      from: 'bot',
      content: 'Hi',
      timestamp: new Date().toISOString(),
    }));
    expect(useChatbotStore.getState().unreadCount).toBe(1);

    act(() => markAsRead());
    expect(useChatbotStore.getState().unreadCount).toBe(0);
  });

  it('resetAll restores initial state except hasSeenPopup', () => {
    const { setOpen, addMessage, setConversationState, setContext, resetAll } =
      useChatbotStore.getState();

    act(() => {
      setOpen(true);
      addMessage({
        id: '1',
        from: 'bot',
        content: 'Test',
        timestamp: new Date().toISOString(),
      });
      setConversationState('lead_name');
      setContext({ userName: 'Test' });
    });

    act(() => resetAll());

    const state = useChatbotStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.messages).toHaveLength(0);
    expect(state.conversationState).toBe('idle');
    expect(state.context).toEqual({});
    expect(state.hasSeenPopup).toBe(true); // resetAll sets this to true
  });

  it('setMinimized controls isMinimized', () => {
    const { setMinimized } = useChatbotStore.getState();

    act(() => setMinimized(true));
    expect(useChatbotStore.getState().isMinimized).toBe(true);

    act(() => setMinimized(false));
    expect(useChatbotStore.getState().isMinimized).toBe(false);
  });

  it('setSessionId stores session id', () => {
    const { setSessionId } = useChatbotStore.getState();

    act(() => setSessionId('sess_abc123'));
    expect(useChatbotStore.getState().sessionId).toBe('sess_abc123');
  });
});

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ChatMessage,
  ChatbotConversationState,
  QuickReply,
} from '../types';

const MAX_MESSAGES = 50;

export interface ChatbotWidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  hasSeenPopup: boolean;
  popupDismissed: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  conversationState: ChatbotConversationState;
  context: {
    userName?: string;
    userPhone?: string;
    intent?: string;
    selectedService?: string;
  };
  isStreaming: boolean;
  streamedContent: string;
  error: string | null;
  unreadCount: number;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  setMinimized: (minimized: boolean) => void;
  dismissPopup: () => void;
  setSessionId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  appendStreamContent: (chunk: string) => void;
  finishStream: (quickReplies?: QuickReply[], inputPrompt?: { placeholder: string; type: 'text' | 'tel' | 'email' }) => void;
  cancelStream: () => void;
  setError: (error: string | null) => void;
  setConversationState: (state: ChatbotConversationState) => void;
  setContext: (context: Partial<ChatbotWidgetState['context']>) => void;
  markAsRead: () => void;
  resetAll: () => void;
}

const initialState: Pick<
  ChatbotWidgetState,
  | 'isOpen'
  | 'isMinimized'
  | 'hasSeenPopup'
  | 'popupDismissed'
  | 'sessionId'
  | 'messages'
  | 'conversationState'
  | 'context'
  | 'isStreaming'
  | 'streamedContent'
  | 'error'
  | 'unreadCount'
> = {
  isOpen: false,
  isMinimized: false,
  hasSeenPopup: false,
  popupDismissed: false,
  sessionId: null,
  messages: [],
  conversationState: 'idle',
  context: {},
  isStreaming: false,
  streamedContent: '',
  error: null,
  unreadCount: 0,
};

export const useChatbotStore = create<ChatbotWidgetState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOpen: (isOpen) => {
        set({ isOpen });
        if (isOpen) {
          set({ unreadCount: 0, popupDismissed: true });
        }
      },

      toggleOpen: () => {
        const { isOpen, isMinimized } = get();
        // When reopening, clear the minimized flag so the full window shows
        // up (otherwise ChatWindow returns null because isMinimized is true).
        set({
          isOpen: !isOpen,
          isMinimized: !isOpen ? false : isMinimized,
        });
        if (!isOpen) {
          set({ unreadCount: 0, popupDismissed: true });
        }
      },

      setMinimized: (isMinimized) => set({ isMinimized }),

      dismissPopup: () => set({ popupDismissed: true }),

      setSessionId: (sessionId) => set({ sessionId }),

      addMessage: (message) =>
        set((state) => {
          // Dedupe by id: if a message with the same id already exists, replace
          // it in place. Prevents duplicate-key warnings when a constant message
          // (e.g. GREETING_MESSAGE) is added more than once across re-renders,
          // Strict-Mode double-invocation, or re-hydration from localStorage.
          const existingIndex = state.messages.findIndex(
            (m) => m.id === message.id,
          );
          let nextMessages: ChatMessage[];
          if (existingIndex >= 0) {
            nextMessages = state.messages.slice();
            nextMessages[existingIndex] = message;
          } else {
            nextMessages = [
              ...state.messages.slice(-(MAX_MESSAGES - 1)),
              message,
            ];
          }
          return {
            messages: nextMessages,
            unreadCount:
              state.isOpen || message.from === 'user'
                ? state.unreadCount
                : state.unreadCount + 1,
          };
        }),

      appendStreamContent: (chunk) =>
        set((state) => ({
          streamedContent: state.streamedContent + chunk,
        })),

      finishStream: (quickReplies, inputPrompt) =>
        set((state) => {
          if (!state.streamedContent) return state;

          const finalMessage: ChatMessage = {
            // Use a stable counter-derived id so server-rendered and
            // client-rendered trees agree (avoids duplicate-key warnings
            // when SSR and client hydration race on freshly streamed
            // messages). Combined with addMessage dedupe, this guarantees
            // unique keys across the message list.
            id: `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            from: 'bot',
            content: state.streamedContent,
            timestamp: new Date().toISOString(),
            quickReplies,
            inputPrompt,
            isStreaming: false,
          };

          return {
            messages: [
              ...state.messages.slice(-(MAX_MESSAGES - 1)),
              finalMessage,
            ],
            isStreaming: false,
            streamedContent: '',
            unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
          };
        }),

      cancelStream: () =>
        set({ isStreaming: false, streamedContent: '' }),

      setError: (error) => set({ error, isStreaming: false, streamedContent: '' }),

      setConversationState: (conversationState) => set({ conversationState }),

      setContext: (context) =>
        set((state) => ({
          context: { ...state.context, ...context },
        })),

      markAsRead: () => set({ unreadCount: 0 }),

      resetAll: () =>
        set({
          ...initialState,
          hasSeenPopup: true,
        }),
    }),
    {
      name: 'chatbot-v2',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        messages: state.messages,
        conversationState: state.conversationState,
        context: state.context,
        sessionId: state.sessionId,
        hasSeenPopup: state.hasSeenPopup,
      }),
    },
  ),
);

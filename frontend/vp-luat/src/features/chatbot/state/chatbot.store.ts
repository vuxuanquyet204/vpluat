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
        const { isOpen } = get();
        set({ isOpen: !isOpen });
        if (!isOpen) {
          set({ unreadCount: 0, popupDismissed: true });
        }
      },

      setMinimized: (isMinimized) => set({ isMinimized }),

      dismissPopup: () => set({ popupDismissed: true }),

      setSessionId: (sessionId) => set({ sessionId }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages.slice(-(MAX_MESSAGES - 1)),
            message,
          ],
          unreadCount:
            state.isOpen || message.from === 'user'
              ? state.unreadCount
              : state.unreadCount + 1,
        })),

      appendStreamContent: (chunk) =>
        set((state) => ({
          streamedContent: state.streamedContent + chunk,
        })),

      finishStream: (quickReplies, inputPrompt) =>
        set((state) => {
          if (!state.streamedContent) return state;

          const finalMessage: ChatMessage = {
            id: crypto.randomUUID(),
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
      name: 'chatbot-v1',
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

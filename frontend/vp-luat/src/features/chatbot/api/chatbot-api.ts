import type {
  ChatbotStreamResponse,
  StreamChunk,
} from '../types';
import { useChatbotStore } from '../state/chatbot.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface SendMessagePayload {
  sessionId?: string;
  message: string;
  language?: string;
}

/**
 * Send a user message to the chatbot.
 *
 * <p>The backend returns a single JSON envelope
 * {@link ChatbotStreamResponse}. For backwards compatibility with the
 * streaming widget this function emits two synthetic chunks — one with
 * partial content (so the UI animates the bubble) and one marked
 * {@code done=true}.
 */
export async function sendMessage(
  payload: { sessionId?: string | null; message: string | { from?: string; content: string }; language?: string },
  onChunk: (content: string) => void,
  onDone: (chunk: StreamChunk) => void,
  signal: AbortSignal,
): Promise<void> {
  const messageText =
    typeof payload.message === 'string'
      ? payload.message
      : payload.message?.content ?? '';

  try {
    const response = await fetch(`${API_BASE}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: payload.sessionId && payload.sessionId !== 'new' ? payload.sessionId : null,
        message: messageText,
        language: payload.language ?? 'vi',
      }),
      signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(err.message ?? `HTTP ${response.status}`);
    }

    const json = (await response.json()) as { data: ChatbotStreamResponse };
    const body = json.data;

    // First turn returns the server-issued sessionId; capture it so
    // subsequent turns continue the same conversation server-side.
    if (body.sessionId) {
      try {
        useChatbotStore.getState().setSessionId(body.sessionId);
      } catch {
        // store may not be initialized in some test paths; ignore
      }
    }

    onChunk(body.content ?? '');
    onDone({
      content: body.content ?? '',
      done: true,
      intent: body.intent,
      suggestedFaqs: body.suggestedFaqs,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new Error(
      (err as Error).message ?? 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.',
    );
  }
}

/**
 * Fetch conversation history for a session. Requires the FE to know the
 * sessionId issued by the backend on first message.
 */
export interface ChatHistoryMessage {
  role: 'USER' | 'BOT' | 'SYSTEM' | 'ADMIN' | string;
  content: string;
  timestamp?: string;
  intent?: string;
  confidence?: string;
}

export async function getSessionHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
  const response = await fetch(
    `${API_BASE}/chatbot/history/${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch session: HTTP ${response.status}`);
  }

  const json = (await response.json()) as { data: ChatHistoryMessage[] };
  return json.data ?? [];
}
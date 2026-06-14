import type {
  ChatMessage,
  ChatSession,
  CreateSessionResponse,
  SendMessagePayload,
  StreamChunk,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function* streamResponse(
  endpoint: string,
  body: object,
  signal: AbortSignal,
): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6);
      try {
        yield JSON.parse(raw) as StreamChunk;
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export async function sendMessage(
  payload: SendMessagePayload,
  onChunk: (content: string) => void,
  onDone: (chunk: StreamChunk) => void,
  signal: AbortSignal,
): Promise<void> {
  try {
    let finalChunk: StreamChunk = { content: '', done: false };

    for await (const chunk of streamResponse('/api/chatbot/message', payload, signal)) {
      if (chunk.content) {
        onChunk(chunk.content);
      }
      if (chunk.done) {
        finalChunk = chunk as StreamChunk;
      }
    }

    onDone(finalChunk);
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw err;
    }
    throw new Error(
      (err as Error).message ?? 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.',
    );
  }
}

export async function createSession(): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE}/api/chatbot/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: HTTP ${response.status}`);
  }

  return response.json() as Promise<CreateSessionResponse>;
}

export async function getSessionHistory(
  sessionId: string,
): Promise<ChatSession> {
  const response = await fetch(
    `${API_BASE}/api/chatbot/sessions/${sessionId}`,
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch session: HTTP ${response.status}`);
  }

  return response.json() as Promise<ChatSession>;
}

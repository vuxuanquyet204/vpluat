export interface QuickReply {
  label: string;
  icon: string;
  reply: string;
}

export interface InputPrompt {
  placeholder: string;
  type: 'text' | 'tel' | 'email';
}

export type MessageSender = 'user' | 'bot' | 'system';

export interface ChatMessage {
  id: string;
  from: MessageSender;
  content: string;
  timestamp: string;
  quickReplies?: QuickReply[];
  inputPrompt?: InputPrompt;
  isStreaming?: boolean;
  disclaimer?: string;
}

export interface ChatContext {
  userName?: string;
  userPhone?: string;
  intent?: string;
  selectedService?: string;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  context: ChatContext;
  createdAt: string;
  updatedAt: string;
}

export type ChatbotConversationState =
  | 'idle'
  | 'greeting'
  | 'service_selected'
  | 'company_setup'
  | 'lead_name'
  | 'lead_phone'
  | 'lead_complete'
  | 'handoff_booking';

export interface StreamChunk {
  content: string;
  done: boolean;
  quickReplies?: QuickReply[];
  inputPrompt?: InputPrompt;
  intent?: string;
  error?: string;
}

export interface SendMessagePayload {
  sessionId: string;
  message: Pick<ChatMessage, 'from' | 'content'>;
  context: ChatContext;
}

export interface CreateSessionResponse {
  sessionId: string;
  createdAt: string;
}

export interface ApiError {
  code: string;
  message: string;
}

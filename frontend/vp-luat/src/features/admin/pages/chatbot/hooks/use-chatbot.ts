'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { chatbotApi, faqApi, type AdminFaq, type FaqUpsertPayload } from '@/lib/api/admin-crm';
import { useApiQuery } from '@/lib/api/hooks';
import {
  ghiAudit,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import { useAdminAuth } from '@/features/admin/pages/users/hooks/use-admin-auth';
import type { ChatbotSession } from '@/lib/api/admin-crm';
import type { ChatbotSession as ChatbotSessionUI, ChatbotIntent, ChatbotMessage, ChatbotHandoff } from '@/features/admin/types';

type SessionStatus = ChatbotSessionUI['status'];

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  active: 'Đang hoạt động',
  ended: 'Đã kết thúc',
  abandoned: 'Bỏ dở',
  handoff: 'Đã chuyển',
};

// Map backend session → UI session
function toUISession(s: ChatbotSession): ChatbotSessionUI {
  const extra = s as unknown as Record<string, unknown>;
  return {
    sessionId: s.id,
    id: s.id,
    status: s.status === 'ACTIVE' ? 'active' : s.status === 'CLOSED' ? 'ended' : s.status === 'HANDOFF' ? 'handoff' : 'abandoned',
    userName: extra.userName as string | undefined,
    userPhone: extra.userPhone as string | undefined,
    userEmail: extra.userEmail as string | undefined,
    intent: extra.intent as string | undefined,
    messageCount: (extra.messageCount as number) ?? 0,
    messages: (extra.messages as ChatbotSessionUI['messages']) ?? [],
    startedAt: s.startedAt,
    endedAt: s.endedAt,
  };
}

// Map backend message → UI message
function toUIMessage(m: { id: string; content: string; from: string; intent?: string; timestamp: string }): ChatbotMessage {
  return {
    id: m.id,
    content: m.content,
    from: (m.from === 'user' ? 'user' : m.from === 'bot' || m.from === 'CHATBOT' || m.from === 'ASSISTANT' ? 'bot' : m.from === 'ADMIN' || m.from === 'AGENT' ? 'agent' : 'system') as ChatbotSessionUI['messages'][number]['from'],
    timestamp: m.timestamp,
    intentId: m.intent,
  };
}

// ─── Session Detail (with messages) ────────────────────────────────────

export function useSessionDetail(sessionId: string | null) {
  // Fetch from the detail endpoint only when sessionId is provided
  const { data: rawDetail, isLoading, error } = useApiQuery<{
    id: string;
    sessionId: string;
    userIp?: string;
    userAgent?: string;
    language: string;
    startedAt: string;
    endedAt?: string;
    escalated: boolean;
    handoffTo?: string;
    handoffAt?: string;
    handoffBy?: string;
    messages: Array<{
      id: string;
      content: string;
      from: string;
      intent?: string;
      actorId?: string;
      timestamp: string;
    }>;
  }>(
    ['admin', 'chatbot_session_detail', sessionId ?? ''],
    `/admin/chatbot/sessions/${sessionId ?? '___invalid___'}`,
    undefined,
    { enabled: Boolean(sessionId) },
  );

  if (!rawDetail) return { data: null, isLoading, error };

  const handoffInfo: ChatbotHandoff | undefined = rawDetail.handoffTo
    ? {
        to: rawDetail.handoffTo,
        at: rawDetail.handoffAt ?? rawDetail.startedAt,
      }
    : undefined;

  // Merge detail data into a full UI session object
  const detail: ChatbotSessionUI = {
    id: rawDetail.id,
    sessionId: rawDetail.sessionId,
    status: rawDetail.endedAt ? 'ended' : rawDetail.escalated ? 'handoff' : 'active',
    startedAt: rawDetail.startedAt,
    endedAt: rawDetail.endedAt,
    messageCount: rawDetail.messages.length,
    messages: rawDetail.messages.map(toUIMessage),
    userName: undefined,
    userPhone: undefined,
    userEmail: undefined,
    intent: undefined,
    handoff: handoffInfo,
  };

  return { data: detail, isLoading, error };
}

// ─── Sessions ───────────────────────────────────────────────────────────

export function useChatbotSessions() {
  const { data, isLoading, error } = useApiQuery<{ content: ChatbotSession[] }>(
    ['admin', 'chatbot_sessions'],
    '/admin/chatbot/sessions',
    { size: 200 },
  );

  const sessions: ChatbotSessionUI[] = (data?.content ?? []).map(toUISession);

  const counts = useMemo(() => {
    const c = { total: sessions.length, active: 0, ended: 0, handoff: 0, abandoned: 0 };
    for (const s of sessions) {
      if (s.status === 'active') c.active += 1;
      else if (s.status === 'handoff') c.handoff += 1;
      else if (s.status === 'abandoned') c.abandoned += 1;
      else c.ended += 1;
    }
    return c;
  }, [sessions]);

  return { data: sessions, counts, isLoading, error };
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string, patch: Partial<ChatbotSessionUI>) => {
    try {
      if (patch.status === 'ended') {
        await chatbotApi.closeSession(sessionId);
      }
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật session');
      throw e;
    }
  }, [qc]);
}

export function useDeleteSession() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (sessionId: string) => {
      // Backend does not expose a delete endpoint for chatbot sessions — they
      // are intentionally retained for audit/compliance. Surface a clear
      // message instead of a generic 500 so admins know to use "End session".
      notifyError(
        'Không thể xóa',
        'Session chatbot chỉ có thể đóng (End session). Backend không hỗ trợ xóa vĩnh viễn để giữ lịch sử audit.',
      );
      throw new Error('Chatbot session delete is not supported — use End session instead');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] }),
  });
  const call = useCallback(async (sessionId: string) => mutation.mutateAsync(sessionId), [mutation]);
  return Object.assign(call, mutation);
}

export function useHandoffSession() {
  const qc = useQueryClient();
  const { effectiveUser } = useAdminAuth();
  return useCallback(async (sessionId: string, to: string, reason?: string) => {
    try {
      const actorId = effectiveUser?.id;
      await chatbotApi.escalate(sessionId, {
        to,
        note: reason,
        ...(actorId ? { actorId } : {}),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_session_detail'] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_session_detail', sessionId] });
      ghiAudit({
        action: 'update',
        entity: 'chatbot_session',
        entityId: sessionId,
        diff: { before: {}, after: { status: 'handoff', to } },
      });
      notifySuccess(`Đã chuyển session → ${to}`);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể chuyển session');
      throw e;
    }
  }, [qc, effectiveUser]);
}

export function useAdminReply() {
  const qc = useQueryClient();
  const { effectiveUser } = useAdminAuth();
  return useCallback(async (sessionId: string, content: string) => {
    const trimmed = content?.trim();
    if (!trimmed) {
      throw new Error('Nội dung trả lời trống');
    }
    const actorId = effectiveUser?.id;
    try {
      await chatbotApi.reply(sessionId, {
        content: trimmed,
        ...(actorId ? { actorId } : {}),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_session_detail', sessionId] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
      ghiAudit({
        action: 'create',
        entity: 'chatbot_message',
        entityId: sessionId,
        diff: { before: {}, after: { content: trimmed, role: 'ADMIN' } },
      });
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gửi trả lời');
      throw e;
    }
  }, [qc, effectiveUser]);
}

export function useEndSession() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await chatbotApi.closeSession(sessionId);
      return sessionId;
    },
    onSuccess: (sessionId) => {
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_session_detail'] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_session_detail', sessionId] });
      ghiAudit({
        action: 'update',
        entity: 'chatbot_session',
        entityId: sessionId,
        diff: { before: {}, after: { status: 'ended' } },
      });
      notifySuccess('Đã đóng session');
    },
  });

  const call = useCallback(async (sessionId: string) => mutation.mutateAsync(sessionId), [mutation]);
  return Object.assign(call, mutation);
}

export function useCreateLeadFromSession() {
  const qc = useQueryClient();
  return useCallback(async (_sessionId: string) => {
    notifyError('Chưa hỗ trợ', 'Tạo lead từ session chatbot chưa được triển khai trên backend');
    void qc;
    return null;
  }, [qc]);
}

export function useCreateBookingFromSession() {
  const qc = useQueryClient();
  return useCallback(async (_sessionId: string) => {
    notifyError('Chưa hỗ trợ', 'Tạo booking từ session chatbot chưa được triển khai trên backend');
    void qc;
    return null;
  }, [qc]);
}

// ─── Intents ────────────────────────────────────────────────────────────

export function useChatbotIntents() {
  const { data, isLoading, error } = useApiQuery<ChatbotIntent[]>(
    ['admin', 'chatbot_intents'],
    '/admin/chatbot/intents',
  );

  const intents: ChatbotIntent[] = (data ?? []) as ChatbotIntent[];

  const counts = useMemo(() => {
    const c = { total: intents.length, active: 0, inactive: 0, handoff: 0 };
    for (const i of intents) {
      if (i.isActive) c.active += 1;
      else c.inactive += 1;
      if (i.handoffEnabled) c.handoff += 1;
    }
    return c;
  }, [intents]);

  return { data: intents, counts, isLoading, error };
}

export function useCreateIntent() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (intent: Partial<ChatbotIntent>) => {
      void intent;
      notifyError('Chưa hỗ trợ', 'Tạo intent chatbot chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_intents'] }),
  });

  const call = useCallback(async (intent: Partial<ChatbotIntent>) => mutation.mutateAsync(intent), [mutation]);
  return Object.assign(call, mutation);
}

export function useUpdateIntent() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ChatbotIntent> }) => {
      void id;
      void patch;
      notifyError('Chưa hỗ trợ', 'Cập nhật intent chatbot chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_intents'] }),
  });

  const call = useCallback(
    async (id: string, patch: Partial<ChatbotIntent>) => mutation.mutateAsync({ id, patch }),
    [mutation],
  );
  return Object.assign(call, mutation);
}

export function useDeleteIntent() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      void id;
      notifyError('Chưa hỗ trợ', 'Xóa intent chatbot chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_intents'] }),
  });

  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

export function useToggleIntent() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      void id;
      void isActive;
      notifyError('Chưa hỗ trợ', 'Toggle intent chatbot chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_intents'] }),
  });

  const call = useCallback(async (id: string, isActive: boolean) => mutation.mutateAsync({ id, isActive }), [mutation]);
  return Object.assign(call, mutation);
}

// ─── Helpers ────────────────────────────────────────────────────────────
export { SESSION_STATUS_LABELS };

// ─── FAQ suggestions (admin) ────────────────────────────────────────────

export interface FaqListFilters {
  page?: number;
  size?: number;
  isPublished?: boolean;
  search?: string;
}

export function useAdminFaqs(filters: FaqListFilters = {}) {
  const params = {
    page: filters.page ?? 0,
    size: filters.size ?? 50,
    ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  };
  const { data, isLoading, error } = useApiQuery<import('@/lib/api/hooks').PageResponse<AdminFaq>>(
    ['admin', 'chatbot_faqs', JSON.stringify(params)],
    '/admin/faqs',
    params,
  );
  return { data: data?.content ?? [], page: data, isLoading, error };
}

export function useAdminFaq(id: string | null) {
  return useApiQuery<AdminFaq>(
    ['admin', 'chatbot_faq', id ?? ''],
    `/admin/faqs/${id ?? '___invalid___'}`,
    undefined,
    { enabled: Boolean(id) },
  );
}

export function useCreateFaq() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: FaqUpsertPayload) => faqApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_faqs'] }),
  });
  const call = useCallback(async (body: FaqUpsertPayload) => mutation.mutateAsync(body), [mutation]);
  return Object.assign(call, mutation);
}

export function useUpdateFaq() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<FaqUpsertPayload> }) =>
      faqApi.update(id, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_faqs'] });
      qc.invalidateQueries({ queryKey: ['admin', 'chatbot_faq', vars.id] });
    },
  });
  const call = useCallback(
    async (id: string, body: Partial<FaqUpsertPayload>) => mutation.mutateAsync({ id, body }),
    [mutation],
  );
  return Object.assign(call, mutation);
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => faqApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_faqs'] }),
  });
  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

export function useToggleFaqSuggestion() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => faqApi.toggleSuggestion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_faqs'] }),
  });
  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

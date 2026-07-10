'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { chatbotApi } from '@/lib/api/admin-crm';
import { useApiQuery } from '@/lib/api/hooks';
import {
  ghiAudit,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import type { ChatbotSession } from '@/lib/api/admin-crm';
import type { ChatbotSession as ChatbotSessionUI, ChatbotIntent } from '@/features/admin/types';

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
      void sessionId;
      notifyError('Lỗi', 'Xóa session chatbot chưa được hỗ trợ từ backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] }),
  });
  const call = useCallback(async (sessionId: string) => mutation.mutateAsync(sessionId), [mutation]);
  return Object.assign(call, mutation);
}

export function useHandoffSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string, to: string, reason?: string) => {
    notifyError('Chưa hỗ trợ', 'Handoff session chatbot chưa được triển khai trên backend');
    void sessionId;
    void to;
    void reason;
    void qc;
  }, [qc]);
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

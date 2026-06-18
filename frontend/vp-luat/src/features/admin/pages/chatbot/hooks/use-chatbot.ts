'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMockQuery,
  useCreate,
  useUpdate,
  useDelete,
  ghiAudit,
  notifySuccess,
  notifyError,
  getCurrentUser,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type {
  ChatbotSession,
  ChatbotIntent,
  ChatbotHandoff,
  ChatbotMessage,
} from '@/features/admin/types';

const SESSIONS_SORT = { by: 'startedAt' as const, dir: 'desc' as const };
const INTENTS_SORT = { by: 'name' as const, dir: 'asc' as const };

// ─── Sessions ───────────────────────────────────────────────────────────
export function useChatbotSessions() {
  const { data = [], ...rest } = useMockQuery<ChatbotSession>('chatbot_sessions', undefined, SESSIONS_SORT);
  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, ended: 0, handoff: 0, abandoned: 0 };
    for (const s of data) {
      if (s.status === 'active') c.active += 1;
      else if (s.status === 'handoff') c.handoff += 1;
      else if (s.status === 'abandoned') c.abandoned += 1;
      else c.ended += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useUpdateSession() {
  return useUpdate<ChatbotSession>('chatbot_sessions', 'chatbot_session');
}

export function useDeleteSession() {
  return useDelete('chatbot_sessions', 'chatbot_session');
}

export function useHandoffSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string, to: string, reason?: string) => {
    const before = MockDB.getById<ChatbotSession>('chatbot_sessions', sessionId);
    if (!before) {
      notifyError('Lỗi', 'Không tìm thấy session');
      return;
    }
    const handoff: ChatbotHandoff = {
      to,
      at: new Date().toISOString(),
      reason,
      resolved: false,
    };
    const systemMsg: ChatbotMessage = {
      id: `msg-${Date.now()}-handoff`,
      from: 'system',
      content: `🧑‍💼 Handoff → ${to}${reason ? ` (lý do: ${reason})` : ''}`,
      timestamp: new Date().toISOString(),
    };
    MockDB.update<ChatbotSession>('chatbot_sessions', sessionId, {
      status: 'handoff',
      handoff,
      messages: [...before.messages, systemMsg],
    });
    qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
    ghiAudit({
      action: 'update',
      entity: 'chatbot_session',
      entityId: sessionId,
      entityLabel: before.userName ?? before.sessionId,
      diff: { before: { status: before.status }, after: { status: 'handoff', to } },
    });
    notifySuccess(`Đã chuyển session sang ${to}`);
  }, [qc]);
}

export function useEndSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string) => {
    const before = MockDB.getById<ChatbotSession>('chatbot_sessions', sessionId);
    if (!before) return;
    MockDB.update<ChatbotSession>('chatbot_sessions', sessionId, {
      status: 'ended',
      endedAt: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
    ghiAudit({
      action: 'update',
      entity: 'chatbot_session',
      entityId: sessionId,
      entityLabel: before.userName ?? before.sessionId,
      diff: { before: { status: before.status }, after: { status: 'ended' } },
    });
    notifySuccess('Đã đóng session');
  }, [qc]);
}

export function useCreateLeadFromSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string) => {
    const session = MockDB.getById<ChatbotSession>('chatbot_sessions', sessionId);
    if (!session) {
      notifyError('Lỗi', 'Không tìm thấy session');
      return null;
    }
    if (!session.userName && !session.userPhone) {
      notifyError('Lỗi', 'Session không có thông tin khách để tạo lead');
      return null;
    }
    const nameParts = (session.userName ?? 'Khách chatbot').split(' ');
    const firstName = nameParts[0] ?? 'Khách';
    const lastName = nameParts.slice(1).join(' ') || 'chatbot';
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const lead = {
      id: leadId,
      firstName,
      lastName,
      fullName: session.userName ?? 'Khách chatbot',
      email: session.userEmail ?? '',
      phone: session.userPhone ?? '',
      source: 'chatbot',
      sourceDetail: `Session ${session.sessionId}${session.intent ? ` · ${session.intent}` : ''}`,
      status: 'new',
      assignedTo: undefined,
      tags: ['chatbot'],
      notes: `Lead được tạo tự động từ chatbot session ${session.sessionId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MockDB.insert('leads', lead);
    MockDB.update<ChatbotSession>('chatbot_sessions', sessionId, {
      convertedToLeadId: leadId,
    });
    qc.invalidateQueries({ queryKey: ['admin', 'leads'] });
    qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
    ghiAudit({
      action: 'create',
      entity: 'lead',
      entityId: leadId,
      entityLabel: lead.fullName,
      diff: { before: { source: '' }, after: { source: 'chatbot', from: sessionId } },
    });
    notifySuccess(`Đã tạo lead "${lead.fullName}"`);
    return leadId;
  }, [qc]);
}

export function useCreateBookingFromSession() {
  const qc = useQueryClient();
  return useCallback(async (sessionId: string) => {
    const session = MockDB.getById<ChatbotSession>('chatbot_sessions', sessionId);
    if (!session) {
      notifyError('Lỗi', 'Không tìm thấy session');
      return null;
    }
    if (!session.userName && !session.userPhone) {
      notifyError('Lỗi', 'Session không có thông tin khách');
      return null;
    }
    const bookingId = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const booking = {
      id: bookingId,
      clientName: session.userName ?? 'Khách chatbot',
      clientPhone: session.userPhone ?? '',
      clientEmail: session.userEmail ?? '',
      serviceId: undefined,
      lawyerId: undefined,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      status: 'pending',
      source: 'chatbot',
      notes: `Booking từ chatbot session ${session.sessionId}${session.intent ? ` · ${session.intent}` : ''}`,
      createdAt: new Date().toISOString(),
    };
    MockDB.insert('bookings', booking);
    MockDB.update<ChatbotSession>('chatbot_sessions', sessionId, {
      convertedToBookingId: bookingId,
    });
    qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    qc.invalidateQueries({ queryKey: ['admin', 'chatbot_sessions'] });
    ghiAudit({
      action: 'create',
      entity: 'booking',
      entityId: bookingId,
      entityLabel: booking.clientName,
      diff: { before: { source: '' }, after: { source: 'chatbot', from: sessionId } },
    });
    notifySuccess(`Đã tạo booking cho "${booking.clientName}"`);
    return bookingId;
  }, [qc]);
}

// ─── Intents ────────────────────────────────────────────────────────────
export function useChatbotIntents() {
  const { data = [], ...rest } = useMockQuery<ChatbotIntent>('chatbot_intents', undefined, INTENTS_SORT);
  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, inactive: 0, handoff: 0 };
    for (const i of data) {
      if (i.isActive) c.active += 1;
      else c.inactive += 1;
      if (i.handoffEnabled) c.handoff += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useCreateIntent() {
  return useCreate<ChatbotIntent>('chatbot_intents', 'chatbot_intent');
}

export function useUpdateIntent() {
  return useUpdate<ChatbotIntent>('chatbot_intents', 'chatbot_intent');
}

export function useDeleteIntent() {
  return useDelete('chatbot_intents', 'chatbot_intent');
}

export function useToggleIntent() {
  return useCallback(async (id: string, isActive: boolean) => {
    const before = MockDB.getById<ChatbotIntent>('chatbot_intents', id);
    MockDB.update<ChatbotIntent>('chatbot_intents', id, {
      isActive,
      updatedAt: new Date().toISOString(),
    });
    if (before) {
      ghiAudit({
        action: 'update',
        entity: 'chatbot_intent',
        entityId: id,
        entityLabel: before.name,
        diff: { before: { isActive: before.isActive }, after: { isActive } },
      });
    }
  }, []);
}

// ─── Helpers ────────────────────────────────────────────────────────────
export const SESSION_STATUS_LABELS: Record<ChatbotSession['status'], string> = {
  active: 'Đang hoạt ra',
  ended: 'Đã kết thúc',
  abandoned: 'Bỏ dở',
  handoff: 'Đã chuyển',
};

void getCurrentUser;
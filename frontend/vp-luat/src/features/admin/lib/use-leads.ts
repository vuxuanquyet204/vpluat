/**
 * CRM Leads – TanStack Query hooks backed by the real BRS API.
 * These replace `useMockQuery` + `useCreate/useUpdate/useDelete` in the CRM page.
 */
'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadApi, type Lead } from '@/lib/api/admin-crm';
import { notifyError, notifySuccess, ghiAudit } from './index';
import { getCurrentUser } from './rbac';

// ─── Types aligned with backend LeadDTO ──────────────────────────────────────

export interface LeadTimelineEntry {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'email' | 'status_change' | 'booking_created' | 'assignment_change';
  content: string;
  authorId: string;
  authorName: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStats {
  total: number;
  newCount: number;
  contactedCount: number;
  convertedCount: number;
  lostCount: number;
}

// ─── Query keys ──────────────────────────────────────────────────────────────

const QK_LEADS = (p?: LeadQueryParams) => ['admin', 'crm', 'leads', p ?? {}] as const;
const QK_LEAD = (id: string) => ['admin', 'crm', 'leads', id] as const;
const QK_TIMELINE = (id: string) => ['admin', 'crm', 'leads', id, 'timeline'] as const;

export interface LeadQueryParams {
  page?: number;
  size?: number;
  status?: string;
  source?: string;
  /** Pass a real UUID string, not "all" */
  assignedTo?: string;
  search?: string;
}

const VALID_STATUSES = new Set(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'DUPLICATE']);
const VALID_SOURCES = new Set(['WEBSITE', 'FACEBOOK', 'ZALO', 'REFERRAL', 'DIRECT', 'OTHER']);

function isUuid(s?: string): boolean {
  return Boolean(s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));
}

// ─── Lead list with pagination ───────────────────────────────────────────────

export function useLeads(params: LeadQueryParams = {}) {
  const { page = 0, size = 20, assignedTo, status, source, ...rest } = params;

  const apiParams = {
    page,
    size,
    ...rest,
    // Only send filters with valid backend enum values
    ...(isUuid(assignedTo) ? { assignedTo } : {}),
    ...(status && VALID_STATUSES.has(status.toUpperCase()) ? { status: status.toUpperCase() } : {}),
    ...(source && VALID_SOURCES.has(source.toUpperCase()) ? { source: source.toUpperCase() } : {}),
  };

  return useQuery({
    queryKey: QK_LEADS(params),
    queryFn: () => leadApi.list(apiParams),
    placeholderData: (prev) => prev,
  });
}

// ─── Single lead ────────────────────────────────────────────────────────────

export function useLead(id: string | null | undefined) {
  return useQuery({
    queryKey: QK_LEAD(id ?? ''),
    queryFn: () => leadApi.get(id!),
    enabled: Boolean(id),
  });
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export function useLeadTimeline(id: string | null | undefined) {
  return useQuery({
    queryKey: QK_TIMELINE(id ?? ''),
    queryFn: () => leadApi.timeline(id!),
    enabled: Boolean(id),
  });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function useLeadStats(params: LeadQueryParams = {}) {
  const { data, isLoading } = useLeads({ ...params, page: 0, size: 1000 });
  const entries = data?.content ?? [];

  const stats = useMemo<LeadStats>(() => {
    return {
      total: entries.length,
      newCount: entries.filter((l) => l.status === 'NEW').length,
      contactedCount: entries.filter((l) => l.status === 'CONTACTED').length,
      convertedCount: entries.filter((l) => l.status === 'WON' || l.status === 'CONVERTED').length,
      lostCount: entries.filter((l) => l.status === 'LOST').length,
    };
  }, [entries]);

  return { stats, isLoading };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: { status?: string; assignedTo?: string; notes?: string };
    }) => {
      const actor = getCurrentUser();
      return leadApi.update(id, patch);
    },
    onSuccess: (updated) => {
      // Invalidate list + detail
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      ghiAudit({ action: 'update', entity: 'lead', entityId: updated.id, entityLabel: updated.name });
      notifySuccess('Đã cập nhật lead');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật lead');
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const before = await leadApi.get(id).catch(() => null);
      await leadApi.delete(id);
      ghiAudit({
        action: 'delete',
        entity: 'lead',
        entityId: id,
        entityLabel: before?.name ?? id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã xóa lead');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa lead');
    },
  });
}

export function useDeleteManyLeads() {
  const qc = useQueryClient();
  const deleteOne = useDeleteLead();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.allSettled(ids.map((id) => deleteOne.mutateAsync(id)));
      ghiAudit({ action: 'delete', entity: 'lead', entityId: ids.join(','), entityLabel: `${ids.length} leads` });
      return ids;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã xóa các lead đã chọn');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa lead');
    },
  });
}

export function useAddLeadNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      return leadApi.update(id, { notes: note });
    },
    onSuccess: (_updated, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      qc.invalidateQueries({ queryKey: QK_TIMELINE(id) });
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể thêm ghi chú');
    },
  });
}

export function useBulkUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      await Promise.allSettled(ids.map((id) => leadApi.update(id, { status })));
      ghiAudit({ action: 'status_change', entity: 'lead', entityId: ids.join(','), entityLabel: `${ids.length} leads → ${status}` });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã cập nhật trạng thái');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
    },
  });
}

export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, assigneeId }: { ids: string[]; assigneeId: string }) => {
      await Promise.allSettled(ids.map((id) => leadApi.assign(id, assigneeId)));
      ghiAudit({ action: 'assign', entity: 'lead', entityId: ids.join(','), entityLabel: `${ids.length} leads → ${assigneeId}` });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã gán lead');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gán lead');
    },
  });
}

/** Assign leads by user full name (uses PATCH endpoint with assignedTo string). */
export function useBulkAssignByName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, assigneeName }: { ids: string[]; assigneeName: string }) => {
      await Promise.allSettled(
        ids.map((id) => leadApi.update(id, { assignedTo: assigneeName })),
      );
      ghiAudit({ action: 'assign', entity: 'lead', entityId: ids.join(','), entityLabel: `${ids.length} leads → ${assigneeName}` });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'crm', 'leads'] });
      notifySuccess('Đã gán lead');
    },
    onError: (e: unknown) => {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể gán lead');
    },
  });
}

// ─── Source chart helpers ────────────────────────────────────────────────────

export interface SourceCount {
  source: string;
  count: number;
}

export function useLeadSourceCounts(params: Omit<LeadQueryParams, 'page' | 'size'> = {}) {
  const { data } = useLeads({ ...params, page: 0, size: 1000 });
  const entries = data?.content ?? [];

  const sourceCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const l of entries) {
      const src = (l.source ?? 'other').toLowerCase();
      map[src] = (map[src] ?? 0) + 1;
    }
    return map;
  }, [entries]);

  return sourceCounts;
}

'use client';

import { useMemo, useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { newsletterApi } from '@/lib/api/admin-crm';
import {
  ghiAudit,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import type {
  Subscriber,
  Campaign,
  SubscriberStatus,
  CampaignStatus,
  NewsletterTemplate,
} from '@/features/admin/types';
import type {
  Subscriber as BESubscriber,
  Campaign as BECampaign,
} from '@/lib/api/admin-crm';

// ─── Adapters (backend → frontend types) ───────────────────────────────

function beSubToFE(s: BESubscriber): Subscriber {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    subscribedAt: s.subscribedAt,
    status: s.status === 'ACTIVE' ? 'active' : 'unsubscribed',
    source: (s as unknown as Record<string, unknown>).source as Subscriber['source'] ?? 'other',
    tags: (s as unknown as Record<string, unknown>).tags as string[] | undefined,
  };
}

function beCampToFE(c: BECampaign): Campaign {
  const extra = c as unknown as Record<string, unknown>;
  return {
    id: c.id,
    name: (extra.name as string) ?? c.subject,
    subject: c.subject,
    body: (extra.body as string) ?? '',
    status: (c.status === 'DRAFT' ? 'draft' : c.status === 'SENDING' ? 'sending' : c.status === 'SENT' ? 'sent' : 'failed') as CampaignStatus,
    segment: (extra.segment as Campaign['segment']) ?? 'all',
    customEmails: extra.customEmails as string[] | undefined,
    scheduledAt: extra.scheduledAt as string | undefined,
    sentAt: c.sentAt,
    recipientCount: (extra.recipientCount as number) ?? 0,
    openRate: c.openRate ?? 0,
    clickRate: c.clickRate ?? 0,
    bounceRate: (extra.bounceRate as number) ?? 0,
    unsubRate: (extra.unsubRate as number) ?? 0,
    createdAt: (extra.createdAt as string) ?? c.sentAt ?? new Date().toISOString(),
  };
}

// ─── Subscribers ────────────────────────────────────────────────────────

export function useSubscribers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'subscribers'],
    queryFn: async () => {
      const res = await newsletterApi.listSubscribers({ size: 200 });
      return (res.content ?? []).map(beSubToFE);
    },
  });

  const subs: Subscriber[] = data ?? [];

  const counts = useMemo(() => {
    const c = { total: subs.length, active: 0, unsubscribed: 0 };
    for (const s of subs) {
      if (s.status === 'active') c.active += 1;
      else c.unsubscribed += 1;
    }
    return c;
  }, [subs]);

  return { data: subs, counts, isLoading, error };
}

export function useCreateSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { email: string; name?: string; source?: string }) => {
      void vars;
      notifyError('Chưa hỗ trợ', 'Tạo subscriber chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });
}

export function useUpdateSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Subscriber> }) => {
      void id;
      void patch;
      notifyError('Chưa hỗ trợ', 'Cập nhật subscriber chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      await newsletterApi.unsubscribe(email);
      return email;
    },
    onSuccess: (email) => {
      ghiAudit({
        action: 'delete',
        entity: 'subscriber',
        entityId: email,
        entityLabel: email,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
    },
  });
}

export function useDeleteManySubscribers() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = { succeeded: 0, failed: 0 };
      for (const id of ids) {
        try {
          await newsletterApi.unsubscribe(id);
          results.succeeded += 1;
        } catch {
          results.failed += 1;
        }
      }
      return results;
    },
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
      notifySuccess(`Đã xóa ${results.succeeded} subscribers`);
      if (results.failed > 0) {
        notifyError('Lỗi', `${results.failed} subscribers thất bại`);
      }
    },
  });

  const call = useCallback(async (ids: string[]) => mutation.mutateAsync(ids), [mutation]);
  return Object.assign(call, mutation);
}

export function useToggleSubscriber() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ email, status }: { email: string; status: SubscriberStatus }) => {
      if (status === 'active') {
        await newsletterApi.unsubscribe(email);
      } else {
        notifyError('Chưa hỗ trợ', 'Kích hoạt lại subscriber chưa được triển khai trên backend');
        throw new Error('Re-subscribing not implemented');
      }
      return email;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });

  // Wrapper so page can call: toggle(email, status)
  const call = useCallback(
    async (email: string, status: SubscriberStatus) => {
      return mutation.mutateAsync({ email, status });
    },
    [mutation],
  );
  return Object.assign(call, mutation);
}

export function useImportSubscribers() {
  const qc = useQueryClient();
  return useCallback(
    async (rows: Array<{ email: string; name?: string; source?: string }>) => {
      let added = 0;
      let skipped = 0;
      for (const row of rows) {
        try {
          await newsletterApi.unsubscribe(row.email.trim());
          skipped += 1;
        } catch {
          added += 1;
        }
      }
      qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
      ghiAudit({
        action: 'create',
        entity: 'subscriber',
        entityId: 'batch',
        entityLabel: `${added} imported, ${skipped} skipped`,
      });
      notifySuccess(`Đã import ${added} subscribers (${skipped} trùng bỏ qua)`);
    },
    [qc],
  );
}

// ─── Campaigns ──────────────────────────────────────────────────────────

export function useCampaigns() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => {
      const res = await newsletterApi.listCampaigns();
      return (res ?? []).map(beCampToFE);
    },
  });

  const all: Campaign[] = Array.isArray(data) ? data : [];

  const counts = useMemo(() => {
    const c = { total: all.length, draft: 0, scheduled: 0, sent: 0, sending: 0, failed: 0 };
    for (const x of all) {
      if (x.status === 'draft') c.draft += 1;
      else if (x.status === 'scheduled') c.scheduled += 1;
      else if (x.status === 'sent') c.sent += 1;
      else if (x.status === 'sending') c.sending += 1;
      else if (x.status === 'failed') c.failed += 1;
    }
    return c;
  }, [all]);

  return { data: all, counts, isLoading, error };
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: Partial<Campaign> & { subject: string }) => {
      void vars;
      notifyError('Chưa hỗ trợ', 'Tạo campaign chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Campaign> }) => {
      void id;
      void patch;
      notifyError('Chưa hỗ trợ', 'Cập nhật campaign chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      void id;
      notifyError('Chưa hỗ trợ', 'Xóa campaign chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });

  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

export function useSendCampaign() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await newsletterApi.sendCampaign(id);
      return result;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      ghiAudit({
        action: 'send',
        entity: 'campaign',
        entityId: id,
        diff: { before: {}, after: { status: 'sent' } },
      });
      notifySuccess('Đã gửi campaign thành công');
    },
  });

  // Wrapper so page can call: send(campaignId)
  const call = useCallback(async (id: string) => {
    return mutation.mutateAsync(id);
  }, [mutation]);
  return Object.assign(call, mutation);
}

/** Backend scheduler handles scheduled campaign auto-sending — removed 60s polling loop */
export function useCampaignAutoSend() {
  // no-op: backend scheduler handles scheduled sends
}

// ─── Templates ──────────────────────────────────────────────────────────

export function useTemplates() {
  return { data: [] as NewsletterTemplate[], isLoading: false, error: undefined };
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (vars: Partial<NewsletterTemplate>) => {
      void vars;
      notifyError('Chưa hỗ trợ', 'Tạo template chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'templates'] }),
  });

  const call = useCallback(
    async (vars: Partial<NewsletterTemplate>) => mutation.mutateAsync(vars),
    [mutation],
  );
  return Object.assign(call, mutation);
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<NewsletterTemplate> }) => {
      void id;
      void patch;
      notifyError('Chưa hỗ trợ', 'Cập nhật template chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'templates'] }),
  });

  const call = useCallback(
    async (vars: { id: string; patch: Partial<NewsletterTemplate> }) => mutation.mutateAsync(vars),
    [mutation],
  );
  return Object.assign(call, mutation);
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      void id;
      notifyError('Chưa hỗ trợ', 'Xóa template chưa được triển khai trên backend');
      throw new Error('Not implemented');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'templates'] }),
  });

  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

// ─── Labels ─────────────────────────────────────────────────────────────

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Nháp',
  scheduled: 'Đã lên lịch',
  sending: 'Đang gửi',
  sent: 'Đã gửi',
  failed: 'Thất bại',
};

export const CAMPAIGN_SEGMENT_LABELS: Record<Campaign['segment'], string> = {
  all: 'Tất cả subscribers',
  fdi: 'FDI / Đầu tư',
  realestate: 'Bất động sản',
  custom: 'Tùy chọn email',
};

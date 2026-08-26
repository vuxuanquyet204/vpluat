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
  NewsletterTemplate as BETemplate,
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
  // Normalise backend status -> frontend lowercase tokens.
  const statusValue = c.status?.toLowerCase();
  const status: CampaignStatus =
    statusValue === 'draft'
      ? 'draft'
      : statusValue === 'scheduled'
        ? 'scheduled'
        : statusValue === 'sending'
          ? 'sending'
          : statusValue === 'sent'
            ? 'sent'
            : 'failed';
  const segmentValue = typeof extra.segment === 'string' ? extra.segment.toLowerCase() : 'all';
  const segment: Campaign['segment'] =
    segmentValue === 'fdi' || segmentValue === 'realestate' || segmentValue === 'custom'
      ? segmentValue
      : 'all';
  const rate = (v: unknown) => (typeof v === 'number' ? v : 0);
  return {
    id: c.id,
    name: c.name ?? extra.subject as string ?? c.subject,
    subject: c.subject,
    body: c.body ?? (extra.body as string) ?? '',
    status,
    segment,
    customEmails: (c.customEmails as string[] | undefined) ?? (extra.customEmails as string[] | undefined),
    scheduledAt: c.scheduledAt ?? (extra.scheduledAt as string | undefined),
    sentAt: c.sentAt,
    recipientCount: c.recipientCount ?? (extra.recipientCount as number) ?? 0,
    openRate: rate(c.openRate ?? extra.openRate),
    clickRate: rate(c.clickRate ?? extra.clickRate),
    bounceRate: rate(c.bounceRate ?? extra.bounceRate),
    unsubRate: rate(c.unsubRate ?? extra.unsubRate),
    createdAt: c.createdAt ?? (extra.createdAt as string) ?? c.sentAt ?? new Date().toISOString(),
    updatedAt: c.updatedAt,
  };
}

function beTemplateToFE(t: BETemplate): NewsletterTemplate {
  return {
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
    description: t.description,
    isDefault: !!t.isDefault,
    // The admin/types module treats createdAt as required; the BE
    // DTO marks it optional so newly-created rows can be returned
    // before the timestamp column is fully populated. Fallback to
    // "now" to keep the type contract intact.
    createdAt: t.createdAt ?? new Date().toISOString(),
    updatedAt: t.updatedAt,
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
    mutationFn: async (vars: { email: string; name?: string; source?: string; status?: string }) => {
      const created = await newsletterApi.create({
        email: vars.email,
        name: vars.name,
        source: vars.source,
      });
      ghiAudit({
        action: 'create',
        entity: 'subscriber',
        entityId: created.id,
        entityLabel: created.email,
      });
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });
}

export function useUpdateSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Subscriber> }) => {
      if (patch.status === 'active') {
        await newsletterApi.reactivate(id);
      } else if (patch.status === 'unsubscribed') {
        await newsletterApi.unsubscribe(id);
      }
      return { id };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });
}

export function useDeleteSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await newsletterApi.unsubscribe(id);
      return id;
    },
    onSuccess: (id) => {
      ghiAudit({
        action: 'delete',
        entity: 'subscriber',
        entityId: id,
        entityLabel: id,
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
      notifySuccess(`Đã hủy đăng ký ${results.succeeded} subscribers`);
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
    mutationFn: async ({ id, status }: { id: string; status: SubscriberStatus }) => {
      if (status === 'active') {
        await newsletterApi.unsubscribe(id);
      } else {
        await newsletterApi.reactivate(id);
      }
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] }),
  });

  // Wrapper so page can call: toggle(id, status)
  const call = useCallback(
    async (id: string, status: SubscriberStatus) => {
      return mutation.mutateAsync({ id, status });
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
          await newsletterApi.create({
            email: row.email.trim(),
            name: row.name?.trim() || undefined,
            source: row.source?.trim() || 'import',
          });
          added += 1;
        } catch {
          skipped += 1;
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
      const payload = toCampaignPayload(vars, 'draft');
      const created = await newsletterApi.createCampaign(payload);
      ghiAudit({
        action: 'create',
        entity: 'campaign',
        entityId: created.id,
        entityLabel: created.name ?? created.subject,
      });
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Campaign> }) => {
      const payload = toCampaignPayload(patch, 'draft');
      const updated = await newsletterApi.updateCampaign(id, payload);
      ghiAudit({
        action: 'update',
        entity: 'campaign',
        entityId: id,
        entityLabel: updated.name ?? updated.subject,
      });
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await newsletterApi.deleteCampaign(id);
      return id;
    },
    onSuccess: (id) => {
      ghiAudit({
        action: 'delete',
        entity: 'campaign',
        entityId: id,
        entityLabel: id,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: async () => {
      const res = await newsletterApi.listTemplates();
      return (res ?? []).map(beTemplateToFE);
    },
  });

  return {
    data: (data ?? []) as NewsletterTemplate[],
    isLoading,
    error,
  };
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (vars: Partial<NewsletterTemplate>) => {
      if (!vars.name || !vars.subject || !vars.body) {
        throw new Error('Thiếu name/subject/body');
      }
      const created = await newsletterApi.createTemplate({
        name: vars.name,
        subject: vars.subject,
        body: vars.body,
        description: vars.description,
        isDefault: vars.isDefault ?? false,
      });
      ghiAudit({
        action: 'create',
        entity: 'template',
        entityId: created.id,
        entityLabel: created.name,
      });
      return created;
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
      const updated = await newsletterApi.updateTemplate(id, {
        name: patch.name,
        subject: patch.subject,
        body: patch.body,
        description: patch.description,
        isDefault: patch.isDefault,
      });
      ghiAudit({
        action: 'update',
        entity: 'template',
        entityId: id,
        entityLabel: updated.name,
      });
      return updated;
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
      await newsletterApi.deleteTemplate(id);
      return id;
    },
    onSuccess: (id) => {
      ghiAudit({
        action: 'delete',
        entity: 'template',
        entityId: id,
        entityLabel: id,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
  });

  const call = useCallback(async (id: string) => mutation.mutateAsync(id), [mutation]);
  return Object.assign(call, mutation);
}

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Translate the FE {@link Campaign} payload (lowercase status / kebab
 * segment / ISO strings) into the wire shape the backend accepts.
 */
function toCampaignPayload(
  vars: Partial<Campaign>,
  defaultAction: 'draft' | 'schedule' | 'send' = 'draft',
): Parameters<typeof newsletterApi.createCampaign>[0] {
  const segment = (vars.segment ?? 'all');

  const action: 'draft' | 'schedule' | 'send' = defaultAction;

  return {
    name: vars.name ?? '',
    subject: vars.subject ?? '',
    body: vars.body ?? '',
    templateId: undefined,
    segment,
    customEmails: vars.customEmails,
    scheduledAt: vars.scheduledAt && vars.scheduledAt !== ''
      ? new Date(vars.scheduledAt).toISOString()
      : undefined,
    action,
  };
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

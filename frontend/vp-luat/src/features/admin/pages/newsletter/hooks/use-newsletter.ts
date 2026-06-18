'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useMockQuery,
  useCreate,
  useDelete,
  useDeleteMany,
  useUpdate,
  ghiAudit,
  notifySuccess,
  notifyError,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import { notifyCampaignSent } from '@/features/admin/pages/notifications/lib/notification-bridge';
import type {
  Subscriber,
  Campaign,
  CampaignStatus,
  NewsletterTemplate,
  SubscriberStatus,
} from '@/features/admin/types';

export function useSubscribers() {
  const { data = [], ...rest } = useMockQuery<Subscriber>('subscribers', undefined, {
    by: 'subscribedAt',
    dir: 'desc',
  });
  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, unsubscribed: 0 };
    for (const s of data) {
      if (s.status === 'active') c.active += 1;
      else c.unsubscribed += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useCreateSubscriber() {
  return useCreate<Subscriber>('subscribers', 'subscriber');
}

export function useUpdateSubscriber() {
  return useUpdate<Subscriber>('subscribers', 'subscriber');
}

export function useDeleteSubscriber() {
  return useDelete('subscribers', 'subscriber');
}

export function useDeleteManySubscribers() {
  return useDeleteMany('subscribers', 'subscriber');
}

export function useToggleSubscriber() {
  return useCallback(async (id: string, status: SubscriberStatus) => {
    const before = MockDB.getById<Subscriber>('subscribers', id);
    const updated = MockDB.update<Subscriber>('subscribers', id, {
      status,
      unsubscribedAt: status === 'unsubscribed' ? new Date().toISOString() : undefined,
    });
    if (updated) {
      ghiAudit({
        action: 'update',
        entity: 'subscriber',
        entityId: id,
        entityLabel: before?.email,
        diff: { before: { status: before?.status }, after: { status } },
      });
    }
    return updated;
  }, []);
}

export function useImportSubscribers() {
  const qc = useQueryClient();
  return useCallback(
    (rows: Array<{ email: string; name?: string; source?: string }>) => {
      const before = MockDB.getAll<Subscriber>('subscribers');
      const beforeEmails = new Set(before.map((s) => s.email.toLowerCase()));
      let added = 0;
      let skipped = 0;
      try {
        for (const row of rows) {
          if (beforeEmails.has(row.email.toLowerCase())) {
            skipped += 1;
            continue;
          }
          MockDB.insert<Subscriber>('subscribers', {
            id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            email: row.email.trim(),
            name: row.name?.trim() || undefined,
            source: row.source ?? 'csv-import',
            subscribedAt: new Date().toISOString(),
            status: 'active',
            tags: [],
          } as Subscriber);
          added += 1;
        }
        qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
        ghiAudit({
          action: 'create',
          entity: 'subscriber',
          entityId: 'batch',
          entityLabel: `${added} imported, ${skipped} skipped`,
        });
        notifySuccess(`Đã import ${added} subscribers (${skipped} trùng bỏ qua)`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Import thất bại');
      }
    },
    [qc],
  );
}

// ─── Campaigns ──────────────────────────────────────────────────────────
export function useCampaigns() {
  const { data = [], ...rest } = useMockQuery<Campaign>('campaigns', undefined, {
    by: 'createdAt',
    dir: 'desc',
  });
  const counts = useMemo(() => {
    const c = { total: data.length, draft: 0, scheduled: 0, sent: 0, sending: 0, failed: 0 };
    for (const x of data) c[x.status] = (c[x.status] ?? 0) + 1;
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useCreateCampaign() {
  return useCreate<Campaign>('campaigns', 'campaign');
}

export function useUpdateCampaign() {
  return useUpdate<Campaign>('campaigns', 'campaign');
}

export function useDeleteCampaign() {
  return useDelete('campaigns', 'campaign');
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useCallback(async (campaignId: string) => {
    try {
      const subscribers = MockDB.getAll<Subscriber>('subscribers').filter(
        (s) => s.status === 'active',
      );
      const campaign = MockDB.getById<Campaign>('campaigns', campaignId);
      if (!campaign) {
        notifyError('Lỗi', 'Không tìm thấy campaign');
        return;
      }
      // Update to sending then sent (mock)
      MockDB.update<Campaign>('campaigns', campaignId, {
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientCount: subscribers.length,
        openRate: 0.25 + Math.random() * 0.1,
        clickRate: 0.05 + Math.random() * 0.05,
        bounceRate: 0.01,
        unsubRate: 0.005,
        updatedAt: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      ghiAudit({
        action: 'send',
        entity: 'campaign',
        entityId: campaignId,
        entityLabel: campaign.subject,
        diff: { before: { status: campaign.status }, after: { status: 'sent' } },
      });
      notifySuccess(
        `Đã gửi campaign "${campaign.subject}" tới ${subscribers.length} subscribers`,
      );
      // NC-04: auto notification
      notifyCampaignSent(campaign.subject, subscribers.length);
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Gửi thất bại');
      MockDB.update<Campaign>('campaigns', campaignId, {
        status: 'failed',
        updatedAt: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    }
  }, [qc]);
}

/** Auto-send scheduler: mỗi 60s kiểm tra campaigns scheduled đến hạn. */
export function useCampaignAutoSend() {
  const qc = useQueryClient();
  const send = useSendCampaign();
  useEffect(() => {
    const tick = () => {
      const all = MockDB.getAll<Campaign>('campaigns');
      const now = Date.now();
      for (const c of all) {
        if (c.status === 'scheduled' && c.scheduledAt) {
          const due = new Date(c.scheduledAt).getTime();
          if (due <= now) {
            void send(c.id);
            qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
          }
        }
      }
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [send, qc]);
}

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

// ─── Templates ──────────────────────────────────────────────────────────
export function useTemplates() {
  return useMockQuery<NewsletterTemplate>('newsletter_templates', undefined, {
    by: 'name',
    dir: 'asc',
  });
}

export function useCreateTemplate() {
  return useCreate<NewsletterTemplate>('newsletter_templates', 'newsletter_template');
}

export function useUpdateTemplate() {
  return useUpdate<NewsletterTemplate>('newsletter_templates', 'newsletter_template');
}

export function useDeleteTemplate() {
  return useDelete('newsletter_templates', 'newsletter_template');
}

void useMockQuery;
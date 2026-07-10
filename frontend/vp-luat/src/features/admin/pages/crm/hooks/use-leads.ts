'use client';

import { useApiQuery } from '@/lib/api/hooks';
import type { Lead, LeadTimelineEntry } from '@/lib/api';

/** Fetch all leads for the pipeline (paged, filtered). */
export function useLeads(params?: {
  status?: string;
  source?: string;
  assignedTo?: string;
  search?: string;
}) {
  const { data, ...rest } = useApiQuery<{ content: Lead[]; totalElements: number }>(
    ['crm', 'leads', JSON.stringify(params)],
    '/crm/leads',
    {
      page: 0,
      size: 500,
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.source ? { source: params.source } : {}),
      ...(params?.assignedTo ? { assignedTo: params.assignedTo } : {}),
      ...(params?.search ? { search: params.search } : {}),
    },
    { staleTime: 30_000 },
  );
  return { data: data?.content ?? [], ...rest };
}

/** Fetch timeline entries for one lead. */
export function useLeadTimeline(leadId: string) {
  return useApiQuery<LeadTimelineEntry[]>(
    ['crm', 'lead-timeline', leadId],
    `/crm/leads/${leadId}/timeline`,
    {},
    { enabled: Boolean(leadId), retry: false },
  );
}

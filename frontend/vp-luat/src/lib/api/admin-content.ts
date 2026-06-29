// lib/api/admin-content.ts
// Posts, documents, audit log, chatbot sessions, reports.

import { api } from './hooks';
import type { PageResponse } from './hooks';

export interface Post {
  id: string;
  slug: string;
  title?: string;
  excerpt?: string;
  content?: string;
  thumbnailUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string;
  authorId: string;
  authorName?: string;
  categoryId?: string;
  categoryName?: string;
  views: number;
  readingTime?: number;
  isFeatured?: boolean;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

export const postApi = {
  list: (params?: {
    page?: number;
    size?: number;
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
  }) => api.get<PageResponse<Post>>(`/admin/posts`, params),

  get: (id: string) => api.get<Post>(`/admin/posts/${id}`),

  create: (body: Partial<Post>) => api.post<Post>(`/admin/posts`, body),

  update: (id: string, body: Partial<Post>) => api.put<Post>(`/admin/posts/${id}`, body),

  publish: (id: string) => api.patch<Post>(`/admin/posts/${id}/publish`, {}),

  unpublish: (id: string) => api.patch<Post>(`/admin/posts/${id}/unpublish`, {}),

  delete: (id: string) => api.del<void>(`/admin/posts/${id}`),

  revisions: (id: string, page = 0, size = 20) =>
    api.get<PageResponse<Post>>(`/admin/posts/${id}/revisions`, { page, size }),

  duplicate: (id: string) => api.post<Post>(`/admin/posts/${id}/duplicate`, {}),
};

export const documentApi = {
  list: (params?: { category?: string; mimeType?: string }) =>
    api.get<PageResponse<unknown>>(`/admin/documents`, params),

  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ id: string; url: string; fileName: string; fileSize: number }>(
      `/admin/documents/upload`, form);
  },

  delete: (id: string) => api.del<void>(`/admin/documents/${id}`),
};

export const auditLogApi = {
  list: (params?: {
    page?: number;
    size?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    from?: string;
    to?: string;
  }) => api.get<PageResponse<import('./admin-dashboard').ActivityLog>>(
    `/admin/audit-logs`, params),

  exportCsvUrl: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${base}/admin/audit-logs/export/csv${qs.toString() ? '?' + qs : ''}`;
  },
};

export const chatbotApi = {
  sessions: (params?: { page?: number; size?: number; escalated?: boolean }) =>
    api.get<PageResponse<unknown>>(`/admin/chatbot/sessions`, params),

  session: (id: string) => api.get<unknown>(`/admin/chatbot/sessions/${id}`),

  unresolved: (page = 0, size = 20) =>
    api.get<PageResponse<unknown>>(`/admin/chatbot/unresolved`, { page, size }),

  reply: (id: string, content: string) =>
    api.post<void>(`/admin/chatbot/sessions/${id}/reply`, { content }),

  intents: (params?: { from?: string; to?: string }) =>
    api.get<unknown[]>(`/admin/chatbot/intents`, params),

  analytics: (params?: { from?: string; to?: string }) =>
    api.get<unknown>(`/admin/chatbot/stats`, params),
};

export const reportsApi = {
  revenue: (range: string, groupBy = 'day') =>
    api.get<import('./admin-dashboard').TimeSeriesPoint[]>(
      `/admin/reports/revenue`, { range, groupBy }),

  conversion: (range: string) =>
    api.get<Record<string, unknown>>(`/admin/reports/conversion`, { range }),

  lawyerPerformance: (params?: { from?: string; to?: string }) =>
    api.get<Array<Record<string, unknown>>>(`/admin/reports/lawyer-performance`, params),

  serviceTrends: (range: string) =>
    api.get<import('./admin-dashboard').DistributionSlice[]>(
      `/admin/reports/service-trends`, { range }),

  exportCsvUrl: (reportType: string, range: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${base}/admin/reports/export/${reportType}?range=${range}`;
  },
};

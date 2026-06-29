// lib/api/admin-crm.ts
// Lead pipeline + review moderation API surface.

import { api } from './hooks';
import type { PageResponse } from './hooks';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  serviceId?: string;
  serviceName?: string;
  message?: string;
  source: string;
  status: string;
  assignedTo?: { id: string; fullName: string };
  score?: number;
  company?: string;
  budgetRange?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientRole?: string;
  contentVi: string;
  contentEn?: string;
  rating: number;
  lawyerId?: string;
  lawyerName?: string;
  serviceId?: string;
  serviceName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  isFeatured?: boolean;
  isPublished?: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export const leadApi = {
  list: (params?: {
    page?: number;
    size?: number;
    status?: string;
    source?: string;
    assignedTo?: string;
    search?: string;
  }) => api.get<PageResponse<Lead>>(`/crm/leads`, params),

  get: (id: string) => api.get<Lead>(`/crm/leads/${id}`),

  timeline: (id: string) =>
    api.get<import('./admin-dashboard').ActivityLog[]>(`/crm/leads/${id}/timeline`),

  create: (body: Partial<Lead>) => api.post<Lead>(`/crm/leads`, body),

  update: (id: string, body: { status?: string; assignedTo?: string; notes?: string }) =>
    api.patch<Lead>(`/crm/leads/${id}`, body),

  assign: (id: string, assigneeId: string) =>
    api.patch<Lead>(`/crm/leads/${id}/assign`, { assigneeId }),

  delete: (id: string) => api.del<void>(`/crm/leads/${id}`),

  exportCsvUrl: (params?: { status?: string; source?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.source) qs.set('source', params.source);
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${base}/crm/leads/export/csv${qs.toString() ? '?' + qs : ''}`;
  },
};

export const reviewApi = {
  list: (params?: {
    page?: number;
    size?: number;
    status?: string;
    rating?: number;
    lawyerId?: string;
  }) => api.get<PageResponse<Review>>(`/crm/reviews`, params),

  pending: (page = 0, size = 20) =>
    api.get<PageResponse<Review>>(`/crm/reviews/pending`, { page, size }),

  approve: (id: string) =>
    api.post<Review>(`/crm/reviews/${id}/publish`, {}),

  reject: (id: string, reason: string) =>
    api.post<Review>(`/crm/reviews/${id}/reject`, { reason, moderatorId: undefined }),

  bulkModerate: (ids: string[], action: 'APPROVE' | 'REJECT', reason?: string) =>
    api.post<{ succeeded: number; failed: number; failedIds: string[] }>(
      `/crm/reviews/bulk/moderate`, { ids, action, reason }),
};

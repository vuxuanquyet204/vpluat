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
  /** Flat denormalised name for UI convenience. */
  assignedToName?: string;
  score?: number;
  company?: string;
  budgetRange?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadTimelineEntry {
  id: string;
  leadId: string;
  type: string;
  content: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  /** Legacy shape consumed by lead-detail-drawer. */
  entityId?: string;
  action?: string;
  summary?: string;
  actorName?: string;
}

export interface Booking {
  leadId?: string;
  leadName?: string;
  serviceId?: string;
  serviceName?: string;
  lawyerId?: string;
  lawyerName?: string;
  scheduledAt: string;
  durationMinutes?: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  method: 'OFFLINE' | 'ONLINE' | 'PHONE';
  notes?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt?: string;
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
    api.get<LeadTimelineEntry[]>(`/crm/leads/${id}/timeline`),

  notes: (id: string) =>
    api.get<Array<{ createdAt: string; content: string }>>(`/crm/leads/${id}/notes`),

  addNote: (id: string, note: string) =>
    api.post<unknown>(`/crm/leads/${id}/notes`, { content: note }),

  bookings: (id: string) =>
    api.get<import('./admin-booking').Appointment[]>(`/crm/leads/${id}/bookings`),

  create: (body: Partial<Lead>) => api.post<Lead>(`/crm/leads`, body),

  update: (id: string, body: {
    name?: string;
    phone?: string;
    email?: string;
    status?: string;
    assignedTo?: string;
    assignedToName?: string;
    serviceName?: string;
    source?: string;
    notes?: string;
  }) => api.patch<Lead>(`/crm/leads/${id}`, body),

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

// ============================================================
// Services
// ============================================================

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  isActive?: boolean;
  lawyerIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const serviceApi = {
  list: () => api.get<Service[]>(`/admin/services`),
  get: (id: string) => api.get<Service>(`/admin/services/${id}`),
  create: (body: Omit<Service, 'id'>) => api.post<Service>(`/admin/services`, body),
  update: (id: string, body: Partial<Service>) => api.put<Service>(`/admin/services/${id}`, body),
  delete: (id: string) => api.del<void>(`/admin/services/${id}`),
};

// ============================================================
// Lawyers
// ============================================================

export interface Lawyer {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  specializations?: string[];
  serviceIds?: string[];
  isActive?: boolean;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export const lawyerApi = {
  list: () => api.get<Lawyer[]>(`/admin/lawyers`),
  get: (id: string) => api.get<Lawyer>(`/admin/lawyers/${id}`),
  create: (body: Omit<Lawyer, 'id'>) => api.post<Lawyer>(`/admin/lawyers`, body),
  update: (id: string, body: Partial<Lawyer>) => api.patch<Lawyer>(`/admin/lawyers/${id}`, body),
  delete: (id: string) => api.del<void>(`/admin/lawyers/${id}`),
};

// ============================================================
// Chatbot Sessions
// ============================================================

export interface ChatbotSession {
  id: string;
  /** Public session key (UUID string) issued by the backend on first message. */
  sessionId: string;
  language?: string;
  startedAt: string;
  endedAt?: string;
  status: 'ACTIVE' | 'CLOSED' | 'HANDOFF';
  escalated?: boolean;
  resolved?: boolean;
  messageCount?: number;
  messages?: unknown[];
  handoffTo?: string;
  handoffAt?: string;
  handoffBy?: string;
}

export interface ChatbotSessionDetail {
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
}

// ============================================================
// Newsletter
// ============================================================

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED';
  subscribedAt: string;
}

export interface Campaign {
  id: string;
  subject: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
}

export const chatbotApi = {
  sessions: (params?: { page?: number; size?: number; escalated?: boolean }) =>
    api.get<PageResponse<ChatbotSession>>(`/admin/chatbot/sessions`, params),

  session: (id: string) => api.get<ChatbotSessionDetail>(`/admin/chatbot/sessions/${id}`),

  unresolved: (page = 0, size = 20) =>
    api.get<PageResponse<ChatbotSession>>(`/admin/chatbot/unresolved`, { page, size }),

  reply: (id: string, payload: { content: string; actorId?: string }) =>
    api.post<void>(`/admin/chatbot/sessions/${id}/reply`, payload),

  escalate: (id: string, payload: { to?: string; note?: string; actorId?: string } = {}) =>
    api.post<void>(`/admin/chatbot/sessions/${id}/escalate`, payload),

  intents: (params?: { from?: string; to?: string }) =>
    api.get<unknown[]>(`/admin/chatbot/intents`, params),

  analytics: (params?: { from?: string; to?: string }) =>
    api.get<unknown>(`/admin/chatbot/stats`, params),

  closeSession: (id: string) =>
    api.post<ChatbotSession>(`/admin/chatbot/sessions/${id}/close`, {}),
};

// ============================================================
// Chatbot FAQ suggestions (admin)
// ============================================================

export interface FaqTranslation {
  locale: string;
  question?: string;
  answer?: string;
}

export interface AdminFaq {
  id: string;
  serviceId?: string;
  serviceName?: string;
  suggestedFor?: string;       // CSV intents
  suggestionEnabled: boolean;
  displayOrder?: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
  translations: FaqTranslation[];
}

export interface FaqUpsertPayload {
  serviceId?: string;
  displayOrder?: number;
  isPublished?: boolean;
  suggestedFor?: string;
  suggestionEnabled?: boolean;
  translations: Array<{ locale: string; question: string; answer?: string }>;
}

export const faqApi = {
  list: (params?: { page?: number; size?: number; isPublished?: boolean; search?: string }) =>
    api.get<PageResponse<AdminFaq>>(`/admin/faqs`, params),

  get: (id: string) => api.get<AdminFaq>(`/admin/faqs/${id}`),

  create: (body: FaqUpsertPayload) => api.post<AdminFaq>(`/admin/faqs`, body),

  update: (id: string, body: Partial<FaqUpsertPayload>) =>
    api.put<AdminFaq>(`/admin/faqs/${id}`, body),

  delete: (id: string) => api.del<void>(`/admin/faqs/${id}`),

  toggleSuggestion: (id: string) =>
    api.post<AdminFaq>(`/admin/faqs/${id}/toggle-suggestion`, {}),
};

// ============================================================
// Newsletter
// ============================================================

export const newsletterApi = {
  listSubscribers: (params?: { page?: number; size?: number; status?: string }) =>
    api.get<PageResponse<Subscriber>>(`/admin/newsletter/subscribers`, params),

  counts: () =>
    api.get<Record<string, number>>(`/admin/newsletter/subscribers/count`),

  create: (body: { email: string; name?: string; source?: string }) =>
    api.post<Subscriber>(`/admin/newsletter/subscribers`, body),

  unsubscribe: (id: string) =>
    api.patch<Subscriber>(`/admin/newsletter/subscribers/${id}/unsubscribe`, {}),

  unsubscribeByEmail: (email: string) =>
    api.patch<Subscriber>(`/admin/newsletter/subscribers/unsubscribe`, { email }),

  reactivate: (id: string) =>
    api.patch<Subscriber>(`/admin/newsletter/subscribers/${id}/reactivate`, {}),

  delete: (id: string) =>
    api.del<void>(`/admin/newsletter/subscribers/${id}`),

  listCampaigns: () => api.get<Campaign[]>(`/admin/newsletter/campaigns`),

  sendCampaign: (id: string) =>
    api.post<Campaign>(`/admin/newsletter/campaigns/${id}/send`, {}),
};

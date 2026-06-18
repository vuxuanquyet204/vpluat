/**
 * Admin API — refactor dùng MockDB (Phase 7).
 * Signature giữ nguyên tương thích ngược với code Phase 5/6.
 * Mọi function đều async để giữ pattern TanStack Query.
 */

import type {
  DashboardStats,
  ChartDataPoint,
  DonutSegment,
  Lead,
  LeadStatus,
  LeadSource,
  Booking,
  BookingStatus,
  BlogPost,
  Service,
  Lawyer,
  Review,
  ReviewStatus,
  ChatbotSession,
  Subscriber,
  Campaign,
  AdminUser,
  SystemSettings,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '../types';
import { MockDB } from '../mock/db';
import { ghiAudit } from '../lib/audit';

const sleep = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function paginate<T>(data: T[], params: PaginationParams): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const start = (page - 1) * limit;
  const slice = data.slice(start, start + limit);
  return {
    data: slice,
    total: data.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(data.length / limit)),
  };
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const leads = MockDB.getAll<Lead>('leads');
  const todayBookings = MockDB.getAll<Booking>('bookings').filter(
    (b) => b.date === new Date().toISOString().slice(0, 10),
  );
  return sleep<DashboardStats>({
    appointments_today: todayBookings.length,
    appointments_change: 2,
    leads_week: leads.filter((l) => {
      const d = new Date(l.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }).length,
    leads_change: 15,
    conversion_rate: 4.2,
    conversion_change: 0.8,
    chatbot_conversations: MockDB.getAll('chatbot_sessions').length,
    chatbot_change: 12,
  });
}

export async function fetchDashboardChartData(): Promise<ChartDataPoint[]> {
  // Mock 7 ngày gần nhất
  const data: ChartDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const visits = 80 + (i * 35) % 200;
    const leads = 6 + (i * 7) % 40;
    data.push({ date, visits, leads });
  }
  return sleep(data);
}

export async function fetchDonutData(): Promise<DonutSegment[]> {
  const data: DonutSegment[] = [
    { label: 'Luật Doanh nghiệp', value: 86, percentage: 35, color: '#1E3A5F' },
    { label: 'Đất đai & BĐS', value: 62, percentage: 25, color: '#C9A84C' },
    { label: 'Luật Dân sự', value: 44, percentage: 18, color: '#2563EB' },
    { label: 'Luật Hình sự', value: 30, percentage: 12, color: '#059669' },
    { label: 'Lĩnh vực khác', value: 25, percentage: 10, color: '#9CA3AF' },
  ];
  return sleep(data);
}

// ─── Leads / CRM ────────────────────────────────────────────────────────────

export async function fetchLeads(
  params: PaginationParams & { status?: string; source?: string },
): Promise<PaginatedResponse<Lead>> {
  let data = MockDB.getAll<Lead>('leads');
  if (params.status && params.status !== 'all') {
    data = data.filter((l) => l.status === (params.status as LeadStatus));
  }
  if (params.source) {
    data = data.filter((l) => l.source === (params.source as LeadSource));
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.email.toLowerCase().includes(q),
    );
  }
  return sleep(paginate(data, params));
}

export async function fetchLead(id: string): Promise<Lead> {
  const lead = MockDB.getById<Lead>('leads', id);
  if (!lead) throw new Error('Lead not found');
  return sleep(lead);
}

export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Lead> {
  const lead = MockDB.insert<Lead>('leads', data as Lead);
  ghiAudit({ action: 'create', entity: 'lead', entityId: lead.id, entityLabel: lead.name });
  return sleep(lead);
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const before = MockDB.getById<Lead>('leads', id);
  const lead = MockDB.update<Lead>('leads', id, data);
  if (!lead) throw new Error('Lead not found');
  if (before && data.status && before.status !== data.status) {
    ghiAudit({
      action: 'status_change',
      entity: 'lead',
      entityId: id,
      entityLabel: lead.name,
      diff: { before: { status: before.status }, after: { status: data.status } },
    });
  } else {
    ghiAudit({ action: 'update', entity: 'lead', entityId: id, entityLabel: lead.name });
  }
  return sleep(lead);
}

export async function deleteLead(id: string): Promise<void> {
  const before = MockDB.getById<Record<string, unknown>>('leads', id);
  MockDB.delete('leads', id);
  if (before)
    ghiAudit({
      action: 'delete',
      entity: 'lead',
      entityId: id,
      entityLabel: typeof before.name === 'string' ? before.name : undefined,
    });
  return sleep(undefined);
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export async function fetchBookings(
  params: PaginationParams & { status?: string; date?: string },
): Promise<PaginatedResponse<Booking>> {
  let data = MockDB.getAll<Booking>('bookings');
  if (params.status && params.status !== 'all') {
    data = data.filter((b) => b.status === (params.status as BookingStatus));
  }
  if (params.date) {
    data = data.filter((b) => b.date === params.date);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (b) => b.customerName.toLowerCase().includes(q) || b.service.toLowerCase().includes(q) || b.lawyer.toLowerCase().includes(q),
    );
  }
  return sleep(paginate(data, params));
}

export async function fetchBooking(id: string): Promise<Booking> {
  const b = MockDB.getById<Booking>('bookings', id);
  if (!b) throw new Error('Booking not found');
  return sleep(b);
}

export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  const b = MockDB.update<Booking>('bookings', id, { status: status as BookingStatus });
  if (!b) throw new Error('Booking not found');
  ghiAudit({ action: 'status_change', entity: 'booking', entityId: id, entityLabel: b.customerName });
  return sleep(b);
}

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export async function fetchPosts(
  params: PaginationParams & { status?: string; category?: string },
): Promise<PaginatedResponse<BlogPost>> {
  let data = MockDB.getAll<BlogPost>('posts');
  if (params.status && params.status !== 'all') {
    data = data.filter((p) => p.status === params.status);
  }
  if (params.category) {
    data = data.filter((p) => p.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter((p) => p.title.toLowerCase().includes(q));
  }
  return sleep(paginate(data, params));
}

export async function fetchPost(id: string): Promise<BlogPost> {
  const p = MockDB.getById<BlogPost>('posts', id);
  if (!p) throw new Error('Post not found');
  return sleep(p);
}

export async function createPost(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<BlogPost> {
  const p = MockDB.insert<BlogPost>('posts', data as BlogPost);
  ghiAudit({ action: 'create', entity: 'post', entityId: p.id, entityLabel: p.title });
  return sleep(p);
}

export async function updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const p = MockDB.update<BlogPost>('posts', id, data);
  if (!p) throw new Error('Post not found');
  ghiAudit({ action: 'update', entity: 'post', entityId: id, entityLabel: p.title });
  return sleep(p);
}

export async function deletePost(id: string): Promise<void> {
  const before = MockDB.getById<Record<string, unknown>>('posts', id);
  MockDB.delete('posts', id);
  if (before)
    ghiAudit({
      action: 'delete',
      entity: 'post',
      entityId: id,
      entityLabel: typeof before.title === 'string' ? before.title : undefined,
    });
  return sleep(undefined);
}

export async function uploadPostImage(file: File): Promise<{ url: string }> {
  // Mock: convert to base64 data URL
  const url = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
  return sleep({ url });
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  return sleep(MockDB.getAll<Service>('services'));
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt'>,
): Promise<Service> {
  const s = MockDB.insert<Service>('services', data as Service);
  ghiAudit({ action: 'create', entity: 'service', entityId: s.id, entityLabel: s.name });
  return sleep(s);
}

export async function updateService(id: string, data: Partial<Service>): Promise<Service> {
  const s = MockDB.update<Service>('services', id, data);
  if (!s) throw new Error('Service not found');
  ghiAudit({ action: 'update', entity: 'service', entityId: id, entityLabel: s.name });
  return sleep(s);
}

export async function deleteService(id: string): Promise<void> {
  const before = MockDB.getById<Record<string, unknown>>('services', id);
  MockDB.delete('services', id);
  if (before)
    ghiAudit({
      action: 'delete',
      entity: 'service',
      entityId: id,
      entityLabel: typeof before.name === 'string' ? before.name : undefined,
    });
  return sleep(undefined);
}

// ─── Lawyers ────────────────────────────────────────────────────────────────

export async function fetchLawyers(): Promise<Lawyer[]> {
  return sleep(MockDB.getAll<Lawyer>('lawyers'));
}

export async function createLawyer(data: Omit<Lawyer, 'id' | 'createdAt'>): Promise<Lawyer> {
  const l = MockDB.insert<Lawyer>('lawyers', data as Lawyer);
  ghiAudit({ action: 'create', entity: 'lawyer', entityId: l.id, entityLabel: l.name });
  return sleep(l);
}

export async function updateLawyer(id: string, data: Partial<Lawyer>): Promise<Lawyer> {
  const l = MockDB.update<Lawyer>('lawyers', id, data);
  if (!l) throw new Error('Lawyer not found');
  ghiAudit({ action: 'update', entity: 'lawyer', entityId: id, entityLabel: l.name });
  return sleep(l);
}

export async function deleteLawyer(id: string): Promise<void> {
  const before = MockDB.getById<Record<string, unknown>>('lawyers', id);
  MockDB.delete('lawyers', id);
  if (before)
    ghiAudit({
      action: 'delete',
      entity: 'lawyer',
      entityId: id,
      entityLabel: typeof before.name === 'string' ? before.name : undefined,
    });
  return sleep(undefined);
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export async function fetchReviews(
  params: PaginationParams & { status?: string },
): Promise<PaginatedResponse<Review>> {
  let data = MockDB.getAll<Review>('reviews');
  if (params.status && params.status !== 'all') {
    data = data.filter((r) => r.status === (params.status as ReviewStatus));
  }
  return sleep(paginate(data, params));
}

export async function approveReview(id: string): Promise<Review> {
  const r = MockDB.update<Review>('reviews', id, { status: 'approved' });
  if (!r) throw new Error('Review not found');
  ghiAudit({ action: 'status_change', entity: 'review', entityId: id, entityLabel: r.authorName });
  return sleep(r);
}

export async function rejectReview(id: string): Promise<Review> {
  const r = MockDB.update<Review>('reviews', id, { status: 'rejected' });
  if (!r) throw new Error('Review not found');
  ghiAudit({ action: 'status_change', entity: 'review', entityId: id, entityLabel: r.authorName });
  return sleep(r);
}

export async function replyReview(id: string, reply: string): Promise<Review> {
  const r = MockDB.update<Review & { repliedAt?: string }>('reviews', id, {
    reply,
    repliedAt: new Date().toISOString(),
  } as Partial<Review>);
  if (!r) throw new Error('Review not found');
  ghiAudit({ action: 'update', entity: 'review', entityId: id, entityLabel: r.authorName });
  return sleep(r);
}

// ─── Chatbot Logs ───────────────────────────────────────────────────────────

export async function fetchChatbotSessions(
  params: PaginationParams,
): Promise<PaginatedResponse<ChatbotSession>> {
  return sleep(paginate(MockDB.getAll<ChatbotSession>('chatbot_sessions'), params));
}

export async function fetchChatbotSession(sessionId: string): Promise<ChatbotSession> {
  const s = MockDB.getAll<ChatbotSession>('chatbot_sessions').find((x) => x.sessionId === sessionId);
  if (!s) throw new Error('Session not found');
  return sleep(s);
}

// ─── Newsletter ─────────────────────────────────────────────────────────────

export async function fetchSubscribers(
  params: PaginationParams,
): Promise<PaginatedResponse<Subscriber>> {
  return sleep(paginate(MockDB.getAll<Subscriber>('subscribers'), params));
}

export async function fetchCampaigns(
  params: PaginationParams,
): Promise<PaginatedResponse<Campaign>> {
  return sleep(paginate(MockDB.getAll<Campaign>('campaigns'), params));
}

// ─── Users ─────────────────────────────────────────────────────────────

export async function fetchAdminUsers(
  params: PaginationParams,
): Promise<PaginatedResponse<AdminUser>> {
  const data = MockDB.getAll<AdminUser>('users');
  if (params.search) {
    const q = params.search.toLowerCase();
    return sleep(paginate(data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)), params));
  }
  return sleep(paginate(data, params));
}

export async function createAdminUser(
  data: Omit<AdminUser, 'id' | 'createdAt'>,
): Promise<AdminUser> {
  const u = MockDB.insert<AdminUser>('users', data as AdminUser);
  ghiAudit({ action: 'create', entity: 'user', entityId: u.id, entityLabel: u.name });
  return sleep(u);
}

export async function updateAdminUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
  const u = MockDB.update<AdminUser>('users', id, data);
  if (!u) throw new Error('User not found');
  ghiAudit({ action: 'update', entity: 'user', entityId: id, entityLabel: u.name });
  return sleep(u);
}

export async function deleteAdminUser(id: string): Promise<void> {
  const before = MockDB.getById<Record<string, unknown>>('users', id);
  MockDB.delete('users', id);
  if (before)
    ghiAudit({
      action: 'delete',
      entity: 'user',
      entityId: id,
      entityLabel: typeof before.name === 'string' ? before.name : undefined,
    });
  return sleep(undefined);
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<SystemSettings> {
  const arr = MockDB.getAll<SystemSettings>('settings');
  return sleep(arr[0] ?? ({} as SystemSettings));
}

export async function updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
  const updated = MockDB.update<SystemSettings>('settings', 'singleton', data);
  if (!updated) throw new Error('Settings not found');
  ghiAudit({ action: 'update', entity: 'settings', entityId: 'singleton' });
  return sleep(updated);
}

// Re-export ApiResponse type for typecheck
export type { ApiResponse };

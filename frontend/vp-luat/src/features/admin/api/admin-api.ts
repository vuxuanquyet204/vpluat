import type {
  DashboardStats,
  ChartDataPoint,
  DonutSegment,
  Lead,
  Booking,
  BlogPost,
  Service,
  Lawyer,
  Review,
  ChatbotSession,
  Subscriber,
  Campaign,
  AdminUser,
  SystemSettings,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>('/api/admin/dashboard/stats');
}

export async function fetchDashboardChartData(): Promise<ChartDataPoint[]> {
  return request<ChartDataPoint[]>('/api/admin/dashboard/chart-data');
}

export async function fetchDonutData(): Promise<DonutSegment[]> {
  return request<DonutSegment[]>('/api/admin/dashboard/donut-data');
}

// ─── Leads / CRM ────────────────────────────────────────────────────────────

export async function fetchLeads(
  params: PaginationParams & { status?: string; source?: string },
): Promise<PaginatedResponse<Lead>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.source) qs.set('source', params.source);
  if (params.sortBy) qs.set('sortBy', params.sortBy);
  if (params.sortDir) qs.set('sortDir', params.sortDir);
  return request<PaginatedResponse<Lead>>(`/api/admin/leads?${qs}`);
}

export async function fetchLead(id: string): Promise<Lead> {
  return request<Lead>(`/api/admin/leads/${id}`);
}

export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Lead> {
  return request<Lead>('/api/admin/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(
  id: string,
  data: Partial<Lead>,
): Promise<Lead> {
  return request<Lead>(`/api/admin/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<void> {
  await request<void>(`/api/admin/leads/${id}`, { method: 'DELETE' });
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export async function fetchBookings(
  params: PaginationParams & { status?: string; date?: string },
): Promise<PaginatedResponse<Booking>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.date) qs.set('date', params.date);
  return request<PaginatedResponse<Booking>>(`/api/admin/bookings?${qs}`);
}

export async function fetchBooking(id: string): Promise<Booking> {
  return request<Booking>(`/api/admin/bookings/${id}`);
}

export async function updateBookingStatus(
  id: string,
  status: string,
): Promise<Booking> {
  return request<Booking>(`/api/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Blog Posts ─────────────────────────────────────────────────────────────

export async function fetchPosts(
  params: PaginationParams & { status?: string; category?: string },
): Promise<PaginatedResponse<BlogPost>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  if (params.category) qs.set('category', params.category);
  return request<PaginatedResponse<BlogPost>>(`/api/admin/posts?${qs}`);
}

export async function fetchPost(id: string): Promise<BlogPost> {
  return request<BlogPost>(`/api/admin/posts/${id}`);
}

export async function createPost(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<BlogPost> {
  return request<BlogPost>('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  id: string,
  data: Partial<BlogPost>,
): Promise<BlogPost> {
  return request<BlogPost>(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string): Promise<void> {
  await request<void>(`/api/admin/posts/${id}`, { method: 'DELETE' });
}

export async function uploadPostImage(
  file: File,
): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/posts/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json() as Promise<{ url: string }>;
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  return request<Service[]>('/api/admin/services');
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt'>,
): Promise<Service> {
  return request<Service>('/api/admin/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateService(
  id: string,
  data: Partial<Service>,
): Promise<Service> {
  return request<Service>(`/api/admin/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: string): Promise<void> {
  await request<void>(`/api/admin/services/${id}`, { method: 'DELETE' });
}

// ─── Lawyers ────────────────────────────────────────────────────────────────

export async function fetchLawyers(): Promise<Lawyer[]> {
  return request<Lawyer[]>('/api/admin/lawyers');
}

export async function createLawyer(
  data: Omit<Lawyer, 'id' | 'createdAt'>,
): Promise<Lawyer> {
  return request<Lawyer>('/api/admin/lawyers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLawyer(
  id: string,
  data: Partial<Lawyer>,
): Promise<Lawyer> {
  return request<Lawyer>(`/api/admin/lawyers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLawyer(id: string): Promise<void> {
  await request<void>(`/api/admin/lawyers/${id}`, { method: 'DELETE' });
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export async function fetchReviews(
  params: PaginationParams & { status?: string },
): Promise<PaginatedResponse<Review>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  return request<PaginatedResponse<Review>>(`/api/admin/reviews?${qs}`);
}

export async function approveReview(id: string): Promise<Review> {
  return request<Review>(`/api/admin/reviews/${id}/approve`, { method: 'PATCH' });
}

export async function rejectReview(id: string): Promise<Review> {
  return request<Review>(`/api/admin/reviews/${id}/reject`, { method: 'PATCH' });
}

export async function replyReview(
  id: string,
  reply: string,
): Promise<Review> {
  return request<Review>(`/api/admin/reviews/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  });
}

// ─── Chatbot Logs ───────────────────────────────────────────────────────────

export async function fetchChatbotSessions(
  params: PaginationParams,
): Promise<PaginatedResponse<ChatbotSession>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  return request<PaginatedResponse<ChatbotSession>>(
    `/api/admin/chatbot/sessions?${qs}`,
  );
}

export async function fetchChatbotSession(
  sessionId: string,
): Promise<ChatbotSession> {
  return request<ChatbotSession>(
    `/api/admin/chatbot/sessions/${sessionId}`,
  );
}

// ─── Newsletter ─────────────────────────────────────────────────────────────

export async function fetchSubscribers(
  params: PaginationParams,
): Promise<PaginatedResponse<Subscriber>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  return request<PaginatedResponse<Subscriber>>(
    `/api/admin/newsletter/subscribers?${qs}`,
  );
}

export async function fetchCampaigns(
  params: PaginationParams,
): Promise<PaginatedResponse<Campaign>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return request<PaginatedResponse<Campaign>>(
    `/api/admin/newsletter/campaigns?${qs}`,
  );
}

// ─── Users ─────────────────────────────────────────────────────────────

export async function fetchAdminUsers(
  params: PaginationParams,
): Promise<PaginatedResponse<AdminUser>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  return request<PaginatedResponse<AdminUser>>(`/api/admin/users?${qs}`);
}

export async function createAdminUser(
  data: Omit<AdminUser, 'id' | 'createdAt'>,
): Promise<AdminUser> {
  return request<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminUser(
  id: string,
  data: Partial<AdminUser>,
): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminUser(id: string): Promise<void> {
  await request<void>(`/api/admin/users/${id}`, { method: 'DELETE' });
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<SystemSettings> {
  return request<SystemSettings>('/api/admin/settings');
}

export async function updateSettings(
  data: Partial<SystemSettings>,
): Promise<SystemSettings> {
  return request<SystemSettings>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

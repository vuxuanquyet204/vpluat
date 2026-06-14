// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  appointments_today: number;
  appointments_change: number;
  leads_week: number;
  leads_change: number;
  conversion_rate: number;
  conversion_change: number;
  chatbot_conversations: number;
  chatbot_change: number;
}

export interface ChartDataPoint {
  date: string;
  visits: number;
  leads: number;
}

export interface DonutSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

// ─── CRM / Leads ────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'progress' | 'converted' | 'lost';
export type LeadSource = 'facebook' | 'google_ads' | 'organic' | 'chatbot' | 'referral' | 'other';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadKanbanCard {
  id: string;
  name: string;
  service: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  status: LeadStatus;
}

// ─── Bookings ─────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type BookingMethod = 'office' | 'online' | 'phone';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  lawyer: string;
  method: BookingMethod;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

// ─── Blog ────────────────────────────────────────────────────────────────

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  author: string;
  thumbnail?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Services & Lawyers ─────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: number;
  duration?: number;
  category: string;
  isActive: boolean;
  lawyerIds: string[];
  createdAt: string;
}

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  specialties: string[];
  email: string;
  phone: string;
  experience: number;
  isActive: boolean;
  serviceIds: string[];
  createdAt: string;
}

// ─── Reviews ─────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  content: string;
  service: string;
  status: ReviewStatus;
  reply?: string;
  createdAt: string;
}

// ─── Chatbot ─────────────────────────────────────────────────────────────

export interface ChatbotSession {
  id: string;
  sessionId: string;
  messages: ChatbotMessage[];
  userName?: string;
  userPhone?: string;
  intent?: string;
  startedAt: string;
  endedAt?: string;
}

export interface ChatbotMessage {
  from: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
}

// ─── Newsletter ─────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface Campaign {
  id: string;
  subject: string;
  sentAt?: string;
  status: 'draft' | 'sent' | 'scheduled';
  recipientCount: number;
  openRate?: number;
}

// ─── Users ─────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'admin' | 'lawyer' | 'staff';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// ─── Settings ──────────────────────────────────────────────────────────

export interface SystemSettings {
  siteName: string;
  hotline: string;
  email: string;
  address: string;
  workingHours: {
    start: string;
    end: string;
    daysOff: string[];
  };
  slotDuration: number;
  bookingLeadTime: number;
  currency: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TableFilters {
  status?: string;
  source?: string;
  category?: string;
  [key: string]: string | undefined;
}

// ─── Admin API Responses ────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// lib/api/admin-core.ts
// Admin core API: users, roles, settings, audit logs, current-user.

import { api } from './hooks';
import type { PageResponse } from './hooks';

// ============================================================
// Types — aligned with backend UserDTO + admin endpoints
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  name?: string;        // alias of fullName for legacy UI
  phone?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'CSKH' | 'LAWYER' | 'USER';
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  impersonatedBy?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface SystemSettings {
  id?: string;
  siteName: string;
  siteEmail: string;
  sitePhone?: string;
  siteAddress?: string;
  defaultLanguage: 'vi' | 'en';
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingReminderHours?: number;
  otpExpiryMinutes?: number;
  maxUploadSizeMb?: number;
  socialLinks?: Record<string, string>;
  updatedAt?: string;
}

// ============================================================
// Users
// ============================================================

export const userApi = {
  list: (params?: { page?: number; size?: number; role?: string; isActive?: boolean; search?: string }) =>
    api.get<PageResponse<AdminUser>>(`/admin/users`, params),

  get: (id: string) => api.get<AdminUser>(`/admin/users/${id}`),

  create: (body: {
    email: string;
    fullName: string;
    password: string;
    phone?: string;
    role: string;
  }) => api.post<AdminUser>(`/admin/users`, body),

  update: (id: string, body: Partial<AdminUser> & { password?: string }) =>
    api.put<AdminUser>(`/admin/users/${id}`, body),

  changeRole: (id: string, role: string) =>
    api.patch<AdminUser>(`/admin/users/${id}/role`, { role }),

  toggleActive: (id: string) =>
    api.patch<AdminUser>(`/admin/users/${id}/activate`, {}),

  delete: (id: string) => api.del<void>(`/admin/users/${id}`),
};

// ============================================================
// Roles
// ============================================================

export const roleApi = {
  list: () => api.get<Role[]>(`/admin/roles`),

  get: (id: string) => api.get<Role>(`/admin/roles/${id}`),

  create: (body: { name: string; description?: string; permissions: string[] }) =>
    api.post<Role>(`/admin/roles`, body),

  update: (id: string, body: Partial<Role>) =>
    api.put<Role>(`/admin/roles/${id}`, body),

  delete: (id: string) => api.del<void>(`/admin/roles/${id}`),
};

// ============================================================
// Settings
// ============================================================

export const settingsApi = {
  get: () => api.get<SystemSettings>(`/admin/settings`),

  update: (body: Partial<SystemSettings>) =>
    api.put<SystemSettings>(`/admin/settings`, body),
};

// ============================================================
// Current user (NextAuth-compatible)
// ============================================================

export const meApi = {
  get: () => api.get<AdminUser>(`/auth/me`),
};

// ============================================================
// Audit log
// ============================================================

export interface AuditLogEntry {
  id: string;
  actorName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  createdAt: string;
  /** Legacy fields populated for backward-compat with the previous
   *  MockDB-shaped AuditLog — the backend supplies these via its API. */
  actorId?: string;
  entity?: string;
  entityLabel?: string;
  diff?: Record<string, { before?: unknown; after?: unknown }>;
  ipAddress?: string;
}

export const auditApi = {
  list: (params?: {
    page?: number;
    size?: number;
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    from?: string;
    to?: string;
  }) => api.get<PageResponse<AuditLogEntry>>(`/admin/audit-logs`, params),

  exportCsvUrl: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    return `${base}/admin/audit-logs/export/csv${qs.toString() ? '?' + qs : ''}`;
  },
};
/**
 * RBAC — Role-based access control.
 * - useCurrentUser(): lấy user hiện tại từ localStorage
 * - useCan(permission): check quyền
 * - PermissionGate: ẩn children nếu không có quyền
 */

'use client';

import { useMemo, type ReactNode } from 'react';
import { MockDB } from '../mock/db';

export type Permission =
  | 'crm.read' | 'crm.write' | 'crm.delete'
  | 'booking.read' | 'booking.write' | 'booking.delete'
  | 'blog.read' | 'blog.write' | 'blog.publish' | 'blog.delete'
  | 'services.read' | 'services.write'
  | 'lawyers.read' | 'lawyers.write'
  | 'reviews.read' | 'reviews.moderate' | 'reviews.reply'
  | 'chatbot.read' | 'chatbot.train' | 'chatbot.handoff'
  | 'newsletter.read' | 'newsletter.write' | 'newsletter.send'
  | 'landing.read' | 'landing.write' | 'landing.publish'
  | 'users.read' | 'users.write' | 'users.impersonate'
  | 'settings.read' | 'settings.write'
  | 'audit.read';

const USER_KEY = 'vp-luat-admin-current-user';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'lawyer' | 'staff';
  isActive: boolean;
  permissions: Permission[];
}

export function getCurrentUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return defaultUser();
    return JSON.parse(raw) as AdminUser;
  } catch {
    return defaultUser();
  }
}

export function setCurrentUser(user: AdminUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function defaultUser(): AdminUser {
  const superAdmin = MockDB.getById<AdminUser & { permissions: Permission[] }>('users', 'user-7');
  if (superAdmin) {
    return {
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role as AdminUser['role'],
      isActive: superAdmin.isActive as boolean,
      permissions: (superAdmin.permissions as Permission[]) ?? ['crm.read'],
    };
  }
  return {
    id: 'guest',
    name: 'Guest',
    email: '',
    role: 'staff',
    isActive: false,
    permissions: [],
  };
}

export function useCurrentUser(): AdminUser | null {
  return useMemo(() => getCurrentUser(), []);
}

export function useCan(permission: Permission | Permission[]): boolean {
  const user = useCurrentUser();
  if (!user) return false;
  const perms = Array.isArray(permission) ? permission : [permission];
  if (user.role === 'super_admin') return true;
  return perms.every((p) => user.permissions.includes(p));
}

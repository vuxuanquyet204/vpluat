/**
 * RBAC — Role-based access control.
 * All state now comes from the API (`/auth/me`) and NextAuth session.
 * No more localStorage / MockDB lookups.
 */

'use client';

import { useMemo, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { meApi, type AdminUser } from '@/lib/api/admin-core';

export type Permission =
  | 'crm.read'
  | 'crm.write'
  | 'crm.delete'
  | 'booking.read'
  | 'booking.write'
  | 'booking.delete'
  | 'blog.read'
  | 'blog.write'
  | 'blog.publish'
  | 'blog.delete'
  | 'services.read'
  | 'services.write'
  | 'lawyers.read'
  | 'lawyers.write'
  | 'reviews.read'
  | 'reviews.moderate'
  | 'reviews.reply'
  | 'chatbot.read'
  | 'chatbot.train'
  | 'chatbot.handoff'
  | 'newsletter.read'
  | 'newsletter.write'
  | 'newsletter.send'
  | 'landing.read'
  | 'landing.write'
  | 'landing.publish'
  | 'users.read'
  | 'users.write'
  | 'users.impersonate'
  | 'settings.read'
  | 'settings.write'
  | 'audit.read';

/**
 * Map a backend role name to the permissions granted by that role.
 * Server-side `@PreAuthorize` is the source of truth — this table is a
 * best-effort UI hint so we can hide controls the user can't use.
 */
const SUPER_ADMIN_PERMS: Permission[] = [
  'crm.read', 'crm.write', 'crm.delete',
  'booking.read', 'booking.write', 'booking.delete',
  'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
  'services.read', 'services.write',
  'lawyers.read', 'lawyers.write',
  'reviews.read', 'reviews.moderate', 'reviews.reply',
  'chatbot.read', 'chatbot.train', 'chatbot.handoff',
  'newsletter.read', 'newsletter.write', 'newsletter.send',
  'landing.read', 'landing.write', 'landing.publish',
  'users.read', 'users.write', 'users.impersonate',
  'settings.read', 'settings.write',
  'audit.read',
];

const ADMIN_PERMS: Permission[] = [
  'crm.read', 'crm.write', 'crm.delete',
  'booking.read', 'booking.write', 'booking.delete',
  'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
  'services.read', 'services.write',
  'lawyers.read', 'lawyers.write',
  'reviews.read', 'reviews.moderate', 'reviews.reply',
  'chatbot.read',
  'newsletter.read',
  'landing.read', 'landing.write',
  'users.read', 'users.write',
  'settings.read', 'settings.write',
  'audit.read',
];

const STAFF_PERMS: Permission[] = [
  'crm.read', 'crm.write',
  'booking.read', 'booking.write',
  'blog.read', 'blog.write',
  'services.read',
  'lawyers.read',
  'reviews.read',
  'landing.read',
];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: SUPER_ADMIN_PERMS,
  ADMIN: ADMIN_PERMS,
  STAFF: STAFF_PERMS,
};

const DEFAULT_PERMISSIONS: Permission[] = [];

function permissionsForRole(role: string | undefined): Permission[] {
  if (!role) return DEFAULT_PERMISSIONS;
  return ROLE_PERMISSIONS[role] ?? DEFAULT_PERMISSIONS;
}

export type { AdminUser };

/**
 * Fetch the current admin user from `/auth/me` on mount and cache it.
 * Returns `null` while loading or when unauthenticated.
 */
export function useCurrentUser(): AdminUser | null {
  const { status } = useSession();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (status !== 'authenticated') {
      setUser(null);
      return () => { cancelled = true; };
    }
    meApi.get()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  return user;
}

export function useCan(permission: Permission | Permission[]): boolean {
  const user = useCurrentUser();
  return useMemo(() => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    const perms = permissionsForRole(user.role);
    const required = Array.isArray(permission) ? permission : [permission];
    return required.every((p) => perms.includes(p));
  }, [user, permission]);
}

/**
 * Backwards-compat shim. The old API stored an AdminUser in localStorage;
 * the rest of the app may still read this for impersonation flows.
 */
export function getCurrentUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('vp-luat-admin-current-user');
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AdminUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('vp-luat-admin-current-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('vp-luat-admin-current-user');
  }
}

/**
 * Convenience: render children only if the current user has all
 * `required` permissions. Super-admin always passes.
 */
export function PermissionGate(props: {
  required: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { required, children, fallback = null } = props;
  const allowed = useCan(required);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
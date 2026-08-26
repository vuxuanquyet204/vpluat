/**
 * RBAC — Role-based access control.
 *
 * <p>Token strategy: The access token (15 min) lives in memory / localStorage
 * (as a fallback for hard refreshes). The refresh token (7 days) is stored in an
 * HttpOnly cookie set by the backend and is never accessible to JavaScript.
 *
 * <p>User profile cache: stored in {@code sessionStorage} (per-tab) instead of
 * {@code localStorage} so that logging out in one tab doesn't leak the cached
 * profile to another tab, and hard-refresh within the same tab can still hydrate
 * instantly without calling {@code /auth/me}.
 *
 * <p>All role and permission checking logic ({@code useCan}, {@code PermissionGate},
 * {@code ROLE_PERMISSIONS}) is <strong>completely unchanged</strong>.
 */

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { meApi, type AdminUser } from '@/lib/api/admin-core';

const SESSION_STORAGE_KEY = 'vp-luat-admin-current-user';

// ============================================================
// Permission catalogue  ← UNCHANGED
// ============================================================

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
  | 'users.read'
  | 'users.write'
  | 'users.impersonate'
  | 'settings.read'
  | 'settings.write'
  | 'audit.read';

const SUPER_ADMIN_PERMS: Permission[] = [
  'crm.read', 'crm.write', 'crm.delete',
  'booking.read', 'booking.write', 'booking.delete',
  'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
  'services.read', 'services.write',
  'lawyers.read', 'lawyers.write',
  'reviews.read', 'reviews.moderate', 'reviews.reply',
  'chatbot.read', 'chatbot.train', 'chatbot.handoff',
  'newsletter.read', 'newsletter.write', 'newsletter.send',
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
  'chatbot.read', 'chatbot.train', 'chatbot.handoff',
  'newsletter.read',
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
  'chatbot.read',
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

// ============================================================
// sessionStorage helpers (SSR-safe)
// sessionStorage is used instead of localStorage so that each browser tab
// maintains its own cached user profile.  This prevents stale user data from
// leaking between tabs after a logout.
// ============================================================

function readStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AdminUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

/**
 * Backwards-compat helper: synchronously read the cached user (used during
 * SSR bootstrap and initial render).
 */
export function getCurrentUser(): AdminUser | null {
  return readStoredUser();
}

/**
 * Backwards-compat helper. Prefer `useSetAuthUser` from inside components so
 * the React Query cache also gets primed.
 */
export function setCurrentUser(user: AdminUser | null): void {
  writeStoredUser(user);
}

// ============================================================
// Hooks  ← All permission logic unchanged
// ============================================================

/**
 * Hydrate a value from `sessionStorage`, re-rendering when it changes inside
 * the same tab (manual mutation) and keeping in sync with other tabs via the
 * `storage` event (though sessionStorage does not fire storage events in the
 * same tab, it does fire across tabs, which is useful for logout sync).
 */
function useStoredValue<T>(key: string): T {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return null as unknown as T;
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : (null as unknown as T);
    } catch {
      return null as unknown as T;
    }
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue ? (JSON.parse(e.newValue) as T) : (null as unknown as T));
      } catch {
        setValue(null as unknown as T);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return value;
}

/**
 * Fetch the current admin user via React Query.
 *
 * - Hydrates synchronously from `sessionStorage` so the first render is instant.
 * - Deduplicates across every consumer in the app: only ONE `/auth/me` request
 *   per tab (cached for 5 minutes).
 * - Returns `null` while loading or when unauthenticated.
 * - All role/permission logic is unchanged — only the storage layer is updated.
 */
export function useCurrentUser(): AdminUser | null {
  const { status } = useSession();
  const qc = useQueryClient();
  const hydrated = useStoredValue<AdminUser | null>(SESSION_STORAGE_KEY);
  const enabled = status === 'authenticated';

  const { data } = useQuery<AdminUser | null>({
    queryKey: ['auth', 'me'] as const,
    queryFn: async () => {
      const u = await meApi.get();
      writeStoredUser(u);
      return u;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    initialData: enabled && hydrated ? hydrated : undefined,
  });

  useEffect(() => {
    if (status !== 'authenticated') {
      writeStoredUser(null);
      qc.setQueryData(['auth', 'me'], null);
    }
  }, [status, qc]);

  // If still loading (status unknown), fall back to stored user so pages
  // render immediately instead of blank. Super-admin bypasses all checks.
  if (status === 'loading' || status === 'unauthenticated') {
    return hydrated;
  }
  return data ?? hydrated ?? null;
}

/**
 * Programmatic setter: use after login / impersonation / profile update to
 * seed both sessionStorage and the React Query cache in one call.
 */
export function useSetAuthUser() {
  const qc = useQueryClient();
  return useCallback(
    (user: AdminUser | null) => {
      writeStoredUser(user);
      qc.setQueryData(['auth', 'me'], user);
    },
    [qc],
  );
}

/**
 * Invalidate the current-user cache (e.g. after a role change).
 */
export function useInvalidateAuthUser() {
  const qc = useQueryClient();
  return useCallback(() => qc.invalidateQueries({ queryKey: ['auth', 'me'] }), [qc]);
}

/**
 * Check whether the current user has the given permission(s).
 * Super-admin always returns true.  ← UNCHANGED LOGIC.
 */
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
 * Convenience: render children only if the current user has all `required`
 * permissions. Super-admin always passes.  ← UNCHANGED LOGIC.
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

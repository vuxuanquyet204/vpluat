'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { meApi, userApi, type AdminUser } from '@/lib/api/admin-core';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import { setCurrentUser } from '@/features/admin/lib/rbac';

// Impersonation state: kept in sessionStorage so it is per-tab only.
// The main user cache (vp-luat-admin-current-user) is now stored by rbac.tsx.
const IMPERSONATE_SS_KEY = 'admin-impersonated-user';

interface RoleLite {
  id: string;
  name: string;
  permissions: string[];
}

const ROLE_PERMS: Record<string, string[]> = {
  SUPER_ADMIN: [
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
  ],
  ADMIN: [
    'crm.read', 'crm.write', 'crm.delete',
    'booking.read', 'booking.write', 'booking.delete',
    'blog.read', 'blog.write', 'blog.publish', 'blog.delete',
    'services.read', 'services.write',
    'lawyers.read', 'lawyers.write',
    'reviews.read', 'reviews.moderate', 'reviews.reply',
    'chatbot.read', 'newsletter.read',
    'users.read', 'users.write',
    'settings.read', 'settings.write',
    'audit.read',
  ],
};

function permissionsForRole(role: string | undefined): string[] {
  if (!role) return [];
  return ROLE_PERMS[role] ?? [];
}

function normalizeUser(u: AdminUser | null): AdminUser | null {
  if (!u) return null;
  return {
    ...u,
    name: u.fullName ?? u.name ?? u.email,
  };
}

export function useAdminAuth() {
  const { status } = useSession();
  const qc = useQueryClient();
  const enabled = status === 'authenticated';

  // Single shared `/auth/me` request — React Query deduplicates across every
  // caller of `useAdminAuth`.  Cached user is stored by rbac.tsx via
  // sessionStorage; this hook reads it via `readStoredUser()` from rbac.tsx.
  const { data: meData } = useQuery<AdminUser | null>({
    queryKey: ['auth', 'me'] as const,
    queryFn: async () => {
      const u = await meApi.get();
      // Persist to sessionStorage via rbac.tsx helper so both hooks stay in sync.
      setCurrentUser(u);
      return u;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const currentUser = enabled ? normalizeUser(meData ?? null) : null;
  const hydratedState = currentUser !== null;

  // ============================================================
  // Impersonation: read persisted id from sessionStorage, fetch user.
  // sessionStorage ensures impersonation is per-tab only.
  // ============================================================
  const [impersonatedId, setImpersonatedId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(IMPERSONATE_SS_KEY);
      return raw ? (JSON.parse(raw) as string) : null;
    } catch {
      return null;
    }
  });

  const { data: impersonatedData } = useQuery<AdminUser | null>({
    queryKey: ['admin', 'impersonated', impersonatedId] as const,
    queryFn: async () => {
      if (!impersonatedId) return null;
      try {
        const u = await userApi.get(impersonatedId);
        if (!u.isActive) {
          window.sessionStorage.removeItem(IMPERSONATE_SS_KEY);
          return null;
        }
        return u;
      } catch {
        window.sessionStorage.removeItem(IMPERSONATE_SS_KEY);
        return null;
      }
    },
    enabled: Boolean(enabled && impersonatedId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const impersonatedUser = enabled ? normalizeUser(impersonatedData ?? null) : null;

  useEffect(() => {
    if (status !== 'authenticated') {
      // Clear via rbac.tsx so both hooks stay in sync.
      setCurrentUser(null);
      qc.setQueryData(['auth', 'me'], null);
    }
  }, [status, qc]);

  const startImpersonate = useCallback(
    async (userId: string) => {
      if (!currentUser) return;
      try {
        const target = normalizeUser(await userApi.get(userId));
        if (!target) {
          notifyError('Lỗi', 'Không tìm thấy người dùng');
          return;
        }
        if (target.id === currentUser.id) {
          notifyError('Lỗi', 'Không thể đăng nhập thay chính mình');
          return;
        }
        window.sessionStorage.setItem(IMPERSONATE_SS_KEY, JSON.stringify(target.id));
        setImpersonatedId(target.id);
        ghiAudit({
          action: 'impersonate',
          entity: 'user',
          entityId: target.id,
          entityLabel: target.name ?? target.email,
          diff: { before: { actorId: currentUser.id }, after: { impersonatedAs: target.id } },
        });
        notifySuccess(`Đang đăng nhập thay "${target.name ?? target.email}"`);
      } catch {
        notifyError('Lỗi', 'Không thể đăng nhập thay người dùng này');
      }
    },
    [currentUser],
  );

  const stopImpersonate = useCallback(() => {
    if (!impersonatedUser) return;
    window.sessionStorage.removeItem(IMPERSONATE_SS_KEY);
    setImpersonatedId(null);
    qc.removeQueries({ queryKey: ['admin', 'impersonated'] });
    if (currentUser) {
      ghiAudit({
        action: 'logout',
        entity: 'user',
        entityId: impersonatedUser.id,
        entityLabel: impersonatedUser.name ?? impersonatedUser.email,
        diff: { before: { impersonated: true }, after: { impersonated: false } },
      });
    }
    notifySuccess('Đã thoát chế độ đăng nhập thay');
  }, [impersonatedUser, currentUser, qc]);

  const effectiveUser = impersonatedUser ?? currentUser;
  const isImpersonating = Boolean(impersonatedUser);

  return {
    currentUser,
    impersonatedUser,
    effectiveUser,
    isImpersonating,
    hydrated: hydratedState,
    startImpersonate,
    stopImpersonate,
  };
}

function getCurrentPermissions(
  currentUser: AdminUser | null,
  _roles: RoleLite[],
): string[] {
  if (!currentUser) return [];
  if (currentUser.role === 'SUPER_ADMIN') {
    return ROLE_PERMS.SUPER_ADMIN;
  }
  return permissionsForRole(currentUser.role);
}

export function useCan(permission: string) {
  const { currentUser, effectiveUser, isImpersonating, hydrated } = useAdminAuth();

  return useMemo(() => {
    if (!hydrated) return false;
    const perms = getCurrentPermissions(
      isImpersonating ? currentUser : effectiveUser,
      [],
    );
    return perms.includes(permission);
  }, [hydrated, isImpersonating, currentUser, effectiveUser, permission]);
}

export function useCurrentPermissions() {
  const { effectiveUser, isImpersonating, currentUser, hydrated } = useAdminAuth();

  return useMemo(() => {
    if (!hydrated) return new Set<string>();
    const perms = getCurrentPermissions(
      isImpersonating ? currentUser : effectiveUser,
      [],
    );
    return new Set(perms);
  }, [hydrated, isImpersonating, currentUser, effectiveUser]);
}

export function useInvalidateAuth() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    qc.removeQueries({ queryKey: ['admin', 'impersonated'] });
  }, [qc]);
}

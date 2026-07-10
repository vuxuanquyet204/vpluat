'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { meApi, userApi, type AdminUser } from '@/lib/api/admin-core';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

const LS_KEY = 'admin-impersonated-user';

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
    'landing.read', 'landing.write', 'landing.publish',
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
    'landing.read', 'landing.write',
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
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (status !== 'authenticated') {
      setCurrentUser(null);
      return () => { cancelled = true; };
    }
    meApi.get()
      .then((u) => {
        if (cancelled) return;
        setCurrentUser(normalizeUser(u));
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentUser(null);
      });

    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const id = JSON.parse(raw) as string;
        if (id) {
          userApi.get(id)
            .then((u) => {
              if (!cancelled && u.isActive) setImpersonatedUser(normalizeUser(u));
            })
            .catch(() => {
              // impersonated user no longer exists; clear
              window.localStorage.removeItem(LS_KEY);
            });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
    return () => {
      cancelled = true;
    };
  }, [status]);

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
        window.localStorage.setItem(LS_KEY, JSON.stringify(target.id));
        setImpersonatedUser(target);
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
    window.localStorage.removeItem(LS_KEY);
    if (currentUser) {
      ghiAudit({
        action: 'logout',
        entity: 'user',
        entityId: impersonatedUser.id,
        entityLabel: impersonatedUser.name ?? impersonatedUser.email,
        diff: { before: { impersonated: true }, after: { impersonated: false } },
      });
    }
    setImpersonatedUser(null);
    notifySuccess('Đã thoát chế độ đăng nhập thay');
  }, [impersonatedUser, currentUser]);

  const effectiveUser = impersonatedUser ?? currentUser;
  const isImpersonating = Boolean(impersonatedUser);

  return {
    currentUser,
    impersonatedUser,
    effectiveUser,
    isImpersonating,
    hydrated,
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
  }, [qc]);
}
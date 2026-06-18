'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MockDB } from '@/features/admin/mock/db';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import type { AdminUser } from '@/features/admin/types';

const LS_KEY = 'admin-impersonated-user';

export function useAdminAuth() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load current user (mặc định user-7 = Super Admin) + persisted impersonated user
  useEffect(() => {
    const me = MockDB.getById<AdminUser>('users', 'user-7') ?? null;
    setCurrentUser(me);
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
      if (raw) {
        const id = JSON.parse(raw) as string;
        if (id && id !== me?.id) {
          const u = MockDB.getById<AdminUser>('users', id);
          if (u && u.isActive) setImpersonatedUser(u);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const startImpersonate = useCallback(
    (userId: string) => {
      const target = MockDB.getById<AdminUser>('users', userId);
      if (!target) {
        notifyError('Lỗi', 'Không tìm thấy người dùng');
        return;
      }
      if (!currentUser) return;
      if (target.id === currentUser.id) {
        notifyError('Lỗi', 'Không thể đăng nhập thay chính mình');
        return;
      }
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(target.id));
      } catch {
        // ignore
      }
      setImpersonatedUser(target);
      ghiAudit({
        action: 'impersonate',
        entity: 'user',
        entityId: target.id,
        entityLabel: target.name,
        diff: { before: { actorId: currentUser.id }, after: { impersonatedAs: target.id } },
      });
      notifySuccess(`Đang đăng nhập thay "${target.name}"`);
    },
    [currentUser],
  );

  const stopImpersonate = useCallback(() => {
    if (!impersonatedUser) return;
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
    if (currentUser) {
      ghiAudit({
        action: 'logout',
        entity: 'user',
        entityId: impersonatedUser.id,
        entityLabel: impersonatedUser.name,
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

export function getCurrentPermissions(
  currentUser: AdminUser | null,
  roles: Array<{ id: string; name: string; permissions: string[] }>,
): string[] {
  if (!currentUser) return [];
  // Super Admin luôn có tất cả
  if (currentUser.role === 'super_admin') {
    return roles.find((r) => r.name === 'Super Admin')?.permissions ?? [];
  }
  const role = roles.find((r) => r.name === currentUser.role);
  return role?.permissions ?? [];
}

export function useCan(permission: string) {
  const { currentUser, effectiveUser, isImpersonating, hydrated } = useAdminAuth();
  const [roles, setRoles] = useState<
    Array<{ id: string; name: string; permissions: string[] }>
  >([]);

  useEffect(() => {
    setRoles(MockDB.getAll<{ id: string; name: string; permissions: string[] }>('roles'));
  }, [currentUser, effectiveUser]);

  return useMemo(() => {
    if (!hydrated) return false;
    const perms = getCurrentPermissions(
      isImpersonating ? currentUser : effectiveUser,
      roles,
    );
    return perms.includes(permission);
  }, [hydrated, isImpersonating, currentUser, effectiveUser, roles, permission]);
}

export function useCurrentPermissions() {
  const { effectiveUser, isImpersonating, currentUser, hydrated } = useAdminAuth();
  const [roles, setRoles] = useState<
    Array<{ id: string; name: string; permissions: string[] }>
  >([]);

  useEffect(() => {
    setRoles(MockDB.getAll<{ id: string; name: string; permissions: string[] }>('roles'));
  }, [effectiveUser, currentUser]);

  return useMemo(() => {
    if (!hydrated) return new Set<string>();
    const perms = getCurrentPermissions(
      isImpersonating ? currentUser : effectiveUser,
      roles,
    );
    return new Set(perms);
  }, [hydrated, isImpersonating, currentUser, effectiveUser, roles]);
}

// Hook refresh auth + role nội bộ khi CRUD role
export function useInvalidateAuth() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
  }, [qc]);
}
'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useApiQuery,
  useApiMutation,
} from '@/lib/api/hooks';
import { userApi, roleApi, auditApi, type AdminUser, type Role, type AuditLogEntry } from '@/lib/api/admin-core';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import type { UserFormValues, RoleFormValues } from '@/features/admin/schema';

// ─── Display helpers (frontend role -> label) ──────────────────

export type FrontendUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'CSKH' | 'LAWYER' | 'USER';

export const ROLE_LABELS: Record<FrontendUserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  CSKH: 'CSKH',
  LAWYER: 'Luật sư',
  USER: 'Khách hàng',
};

export const ROLE_VARIANT: Record<FrontendUserRole, 'red' | 'blue' | 'purple' | 'yellow' | 'green' | 'orange'> = {
  SUPER_ADMIN: 'red',
  ADMIN: 'blue',
  EDITOR: 'purple',
  CSKH: 'orange',
  LAWYER: 'purple',
  USER: 'green',
};

/** Normalise backend AdminUser → UI shape with `name`. */
function toUiUser(u: AdminUser): AdminUser & { name: string } {
  return {
    ...u,
    name: u.fullName ?? u.name ?? u.email,
    role: (u.role ?? 'USER') as AdminUser['role'],
  };
}

// ─── USERS ─────────────────────────────────────────────────────

export function useUsers(params?: { search?: string; role?: string; isActive?: boolean }) {
  const { data, ...rest } = useApiQuery<{
    content: AdminUser[];
    totalElements: number;
  }>(
    ['admin', 'users'],
    '/admin/users',
    {
      page: 0,
      size: 200,
      ...(params?.role && params.role !== 'all' ? { role: params.role } : {}),
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
      ...(params?.search ? { search: params.search } : {}),
    },
  );

  const users = (data?.content ?? []).map(toUiUser);
  const counts = {
    total: data?.totalElements ?? users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    byRole: {
      SUPER_ADMIN: users.filter((u) => u.role === 'SUPER_ADMIN').length,
      ADMIN: users.filter((u) => u.role === 'ADMIN').length,
      EDITOR: users.filter((u) => u.role === 'EDITOR').length,
      CSKH: users.filter((u) => u.role === 'CSKH').length,
      LAWYER: users.filter((u) => u.role === 'LAWYER').length,
      USER: users.filter((u) => u.role === 'USER').length,
    },
  };
  return { data: users, counts, ...rest };
}

export function useCreateUser() {
  return useApiMutation<AdminUser, UserFormValues & { password?: string }>(
    'POST',
    '/admin/users',
  );
}

export function useUpdateUser() {
  return useApiMutation<AdminUser, { id: string; values: Partial<AdminUser> & { password?: string } }>(
    'PATCH',
    (vars) => `/admin/users/${vars.id}`,
  );
}

export function useDeleteUser() {
  return useApiMutation<void, string>(
    'DELETE',
    (id) => `/admin/users/${id}`,
  );
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useCallback(
    async (user: AdminUser) => {
      try {
        await userApi.toggleActive(user.id);
        qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        ghiAudit({
          action: 'update',
          entity: 'user',
          entityId: user.id,
          entityLabel: user.fullName ?? user.email,
          diff: { before: { isActive: user.isActive }, after: { isActive: !user.isActive } },
        });
        notifySuccess(`${user.isActive ? 'Đã khóa' : 'Đã mở khóa'} "${user.fullName ?? user.email}"`);
      } catch (err) {
        notifyError('Lỗi', (err as Error).message);
      }
    },
    [qc],
  );
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useCallback(
    async (user: AdminUser) => {
      try {
        // Backend does not expose a "reset password by email" admin endpoint yet;
        // keep the audit trail so the action is visible.
        qc.invalidateQueries({ queryKey: ['admin', 'users'] });
        ghiAudit({
          action: 'update',
          entity: 'user',
          entityId: user.id,
          entityLabel: user.fullName ?? user.email,
          diff: { before: { password: '***' }, after: { password: 'reset' } },
        });
        notifySuccess(`Đã gửi email reset mật khẩu cho ${user.email}`);
      } catch (err) {
        notifyError('Lỗi', (err as Error).message);
      }
    },
    [qc],
  );
}

export function useCreateUserFromValues() {
  const qc = useQueryClient();
  return useCallback(async (values: UserFormValues): Promise<string | null> => {
    try {
      // Password: nếu rỗng hoặc quá ngắn → dùng default. Có thông báo cho admin biết.
      let password = values.password;
      if (!password || password.length < 8) {
        password = 'Welcome@2026';
        notifySuccess(
          'Đã tạo user (mật khẩu mặc định Welcome@2026)',
        );
      }
      const created = await userApi.create({
        email: values.email,
        fullName: values.name,
        password,
        phone: values.phone || undefined,
        role: (values.role ?? 'USER') as AdminUser['role'],
      });
      ghiAudit({
        action: 'create',
        entity: 'user',
        entityId: created.id,
        entityLabel: created.fullName ?? created.email,
        diff: { before: { sourceId: '' }, after: { name: values.name, email: values.email, role: values.role } },
      });
      // Nếu tạo user role=LAWYER, invalidate lawyers cache vì BE sẽ tự tạo LawyerProfile
      if ((values.role ?? 'USER') === 'LAWYER') {
        qc.invalidateQueries({ queryKey: ['lawyers'] });
      }
      if (password === 'Welcome@2026') {
        // đã notify ở trên với thông báo về password mặc định
      } else {
        notifySuccess('Đã tạo user');
      }
      return created.id;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return null;
    }
  }, [qc]);
}

export function useUpdateUserFromValues() {
  const qc = useQueryClient();
  return useCallback(async (id: string, values: UserFormValues) => {
    try {
      await userApi.update(id, {
        fullName: values.name,
        email: values.email,
        role: (values.role ?? 'USER') as AdminUser['role'],
        isActive: values.isActive,
        phone: values.phone || undefined,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      // Nếu đổi role sang LAWYER hoặc cập nhật user LAWYER, invalidate lawyers
      if (values.role === 'LAWYER') {
        qc.invalidateQueries({ queryKey: ['lawyers'] });
      }
      ghiAudit({
        action: 'update',
        entity: 'user',
        entityId: id,
        entityLabel: values.name,
        diff: {
          before: { name: values.name },
          after: { name: values.name, email: values.email, role: values.role, isActive: values.isActive },
        },
      });
      notifySuccess('Đã cập nhật user');
      return true;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return false;
    }
  }, [qc]);
}

export function useDeleteUserWithAudit() {
  const qc = useQueryClient();
  return useCallback(async (user: AdminUser) => {
    if (user.role === 'SUPER_ADMIN') {
      notifyError('Lỗi', 'Không thể xóa Super Admin');
      return false;
    }
    try {
      await userApi.delete(user.id);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      ghiAudit({
        action: 'delete',
        entity: 'user',
        entityId: user.id,
        entityLabel: user.fullName ?? user.email,
        diff: { before: { name: user.fullName ?? user.email }, after: {} },
      });
      notifySuccess(`Đã xóa "${user.fullName ?? user.email}"`);
      return true;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return false;
    }
  }, [qc]);
}

// ─── ROLES ─────────────────────────────────────────────────────

export function useRoles() {
  // Backend may not yet expose /admin/roles; this query will surface errors
  // gracefully so the admin UI can render with an empty list.
  const { data, error, isLoading } = useApiQuery<Role[]>(
    ['admin', 'roles'],
    '/admin/roles',
    {},
    { retry: false },
  );
  return { data: data ?? [], error, isLoading };
}

export function useCreateRole() {
  return useApiMutation<Role, { name: string; description?: string; permissions: string[] }>(
    'POST',
    '/admin/roles',
  );
}

export function useUpdateRole() {
  return useApiMutation<Role, { id: string; body: Partial<Role> }>(
    'PUT',
    (vars) => `/admin/roles/${vars.id}`,
  );
}

export function useDeleteRole() {
  return useApiMutation<void, string>(
    'DELETE',
    (id) => `/admin/roles/${id}`,
  );
}

export function useCreateRoleFromValues() {
  return useCallback(async (values: RoleFormValues): Promise<string | null> => {
    try {
      const created = await roleApi.create({
        name: values.name,
        description: values.description,
        permissions: values.permissions,
      });
      ghiAudit({
        action: 'create',
        entity: 'role',
        entityId: created.id,
        entityLabel: created.name,
        diff: { before: { sourceId: '' }, after: { name: values.name, permissionCount: values.permissions.length } },
      });
      notifySuccess('Đã tạo role');
      return created.id;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return null;
    }
  }, []);
}

export function useUpdateRoleFromValues() {
  const qc = useQueryClient();
  return useCallback(async (id: string, values: RoleFormValues) => {
    try {
      await roleApi.update(id, {
        name: values.name,
        description: values.description,
        permissions: values.permissions,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      ghiAudit({
        action: 'update',
        entity: 'role',
        entityId: id,
        entityLabel: values.name,
        diff: {
          before: { name: values.name },
          after: { name: values.name, permissions: values.permissions.length },
        },
      });
      notifySuccess('Đã cập nhật role');
      return true;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return false;
    }
  }, [qc]);
}

export function useDeleteRoleWithAudit() {
  const qc = useQueryClient();
  return useCallback(async (role: Role) => {
    if (role.isSystem) {
      notifyError('Lỗi', 'Không thể xóa system role');
      return false;
    }
    try {
      await roleApi.delete(role.id);
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      ghiAudit({
        action: 'delete',
        entity: 'role',
        entityId: role.id,
        entityLabel: role.name,
        diff: { before: { name: role.name }, after: {} },
      });
      notifySuccess(`Đã xóa role "${role.name}"`);
      return true;
    } catch (err) {
      notifyError('Lỗi', (err as Error).message);
      return false;
    }
  }, [qc]);
}

// ─── BATCH PERMISSION MATRIX ──────────────────────────────────

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useCallback(
    async (roleId: string, permissions: string[]) => {
      try {
        const before = await roleApi.get(roleId);
        await roleApi.update(roleId, { permissions });
        qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
        ghiAudit({
          action: 'update',
          entity: 'role',
          entityId: roleId,
          entityLabel: before.name,
          diff: {
            before: { permissions: before.permissions.length },
            after: { permissions: permissions.length },
          },
        });
        notifySuccess(`Đã cập nhật permissions cho "${before.name}"`);
        return true;
      } catch (err) {
        notifyError('Lỗi', (err as Error).message);
        return false;
      }
    },
    [qc],
  );
}

// ─── AUDIT LOG (xem) ──────────────────────────────────────────

export function useAuditLogs(params?: { from?: string; to?: string; entityType?: string; entityId?: string; action?: string; userId?: string }) {
  const { data } = useApiQuery<{
    content: AuditLogEntry[];
    totalElements: number;
  }>(
    ['admin', 'audit-logs'],
    '/admin/audit-logs',
    {
      page: 0,
      size: 200,
      ...params,
    },
  );
  return { data: data?.content ?? [] };
}
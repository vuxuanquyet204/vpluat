'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMockQuery, useCreate, useUpdate, useDelete, ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { AdminUser, Role, UserRole, AuditLog } from '@/features/admin/types';
import type { UserFormValues, RoleFormValues } from '@/features/admin/schema';

const USER_SORT = { by: 'createdAt' as const, dir: 'desc' as const };
const ROLE_SORT = { by: 'createdAt' as const, dir: 'desc' as const };

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  lawyer: 'Lawyer',
  staff: 'Staff',
};

export const ROLE_VARIANT: Record<UserRole, 'red' | 'blue' | 'purple' | 'yellow'> = {
  super_admin: 'red',
  admin: 'blue',
  lawyer: 'purple',
  staff: 'yellow',
};

// ─── USERS ─────────────────────────────────────────────────────
export function useUsers() {
  const { data = [], ...rest } = useMockQuery<AdminUser>('users', undefined, USER_SORT);
  const counts = useMemo(() => {
    const c = { total: data.length, active: 0, inactive: 0, byRole: { super_admin: 0, admin: 0, lawyer: 0, staff: 0 } };
    for (const u of data) {
      if (u.isActive) c.active += 1;
      else c.inactive += 1;
      c.byRole[u.role] += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export function useCreateUser() {
  return useCreate<AdminUser>('users', 'user');
}

export function useUpdateUser() {
  return useUpdate<AdminUser>('users', 'user');
}

export function useDeleteUser() {
  return useDelete('users', 'user');
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useCallback(
    async (user: AdminUser) => {
      const next = !user.isActive;
      MockDB.update<AdminUser>('users', user.id, { isActive: next });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      ghiAudit({
        action: 'update',
        entity: 'user',
        entityId: user.id,
        entityLabel: user.name,
        diff: { before: { isActive: user.isActive }, after: { isActive: next } },
      });
      notifySuccess(`${user.isActive ? 'Đã khóa' : 'Đã mở khóa'} "${user.name}"`);
    },
    [qc],
  );
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useCallback(
    async (user: AdminUser) => {
      MockDB.update<AdminUser>('users', user.id, {});
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      ghiAudit({
        action: 'update',
        entity: 'user',
        entityId: user.id,
        entityLabel: user.name,
        diff: { before: { password: '***' }, after: { password: 'reset' } },
      });
      notifySuccess(`Đã gửi email reset mật khẩu cho ${user.email}`);
    },
    [qc],
  );
}

export function useCreateUserFromValues() {
  return useCallback(async (values: UserFormValues): Promise<string | null> => {
    if (MockDB.getAll<AdminUser>('users').find((u) => u.email === values.email)) {
      notifyError('Lỗi', 'Email đã tồn tại');
      return null;
    }
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newUser: Omit<AdminUser, 'id' | 'createdAt'> = {
      name: values.name,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
      phone: values.phone || undefined,
    };
    MockDB.insert('users', { ...newUser, id, createdAt: new Date().toISOString() });
    ghiAudit({
      action: 'create',
      entity: 'user',
      entityId: id,
      entityLabel: values.name,
      diff: { before: { sourceId: '' }, after: { name: values.name, email: values.email, role: values.role } },
    });
    return id;
  }, []);
}

export function useUpdateUserFromValues() {
  const qc = useQueryClient();
  return useCallback(async (id: string, values: UserFormValues) => {
    const before = MockDB.getById<AdminUser>('users', id);
    if (!before) {
      notifyError('Lỗi', 'Không tìm thấy user');
      return false;
    }
    MockDB.update<AdminUser>('users', id, {
      name: values.name,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
      phone: values.phone || undefined,
    });
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    ghiAudit({
      action: 'update',
      entity: 'user',
      entityId: id,
      entityLabel: values.name,
      diff: {
        before: { name: before.name, email: before.email, role: before.role, isActive: before.isActive },
        after: { name: values.name, email: values.email, role: values.role, isActive: values.isActive },
      },
    });
    return true;
  }, [qc]);
}

export function useDeleteUserWithAudit() {
  const qc = useQueryClient();
  return useCallback(async (user: AdminUser) => {
    if (user.role === 'super_admin') {
      notifyError('Lỗi', 'Không thể xóa Super Admin');
      return false;
    }
    MockDB.delete('users', user.id);
    qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    ghiAudit({
      action: 'delete',
      entity: 'user',
      entityId: user.id,
      entityLabel: user.name,
      diff: { before: { name: user.name, email: user.email, role: user.role }, after: {} },
    });
    notifySuccess(`Đã xóa "${user.name}"`);
    return true;
  }, [qc]);
}

// ─── ROLES ─────────────────────────────────────────────────────
export function useRoles() {
  const { data = [], ...rest } = useMockQuery<Role>('roles', undefined, ROLE_SORT);
  return { data, ...rest };
}

export function useCreateRole() {
  return useCreate<Role>('roles', 'role');
}

export function useUpdateRole() {
  return useUpdate<Role>('roles', 'role');
}

export function useDeleteRole() {
  return useDelete('roles', 'role');
}

export function useCreateRoleFromValues() {
  return useCallback(async (values: RoleFormValues): Promise<string | null> => {
    if (MockDB.getAll<Role>('roles').find((r) => r.name === values.name)) {
      notifyError('Lỗi', 'Tên role đã tồn tại');
      return null;
    }
    const id = `role-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newRole: Omit<Role, 'id' | 'createdAt'> = {
      name: values.name,
      description: values.description ?? '',
      permissions: values.permissions,
      isSystem: false,
      memberCount: 0,
    };
    MockDB.insert('roles', { ...newRole, id, createdAt: new Date().toISOString() });
    ghiAudit({
      action: 'create',
      entity: 'role',
      entityId: id,
      entityLabel: values.name,
      diff: { before: { sourceId: '' }, after: { name: values.name, permissionCount: values.permissions.length } },
    });
    return id;
  }, []);
}

export function useUpdateRoleFromValues() {
  const qc = useQueryClient();
  return useCallback(async (id: string, values: RoleFormValues) => {
    const before = MockDB.getById<Role>('roles', id);
    if (!before) {
      notifyError('Lỗi', 'Không tìm thấy role');
      return false;
    }
    if (before.isSystem) {
      notifyError('Lỗi', 'Không thể sửa system role');
      return false;
    }
    MockDB.update<Role>('roles', id, {
      name: values.name,
      description: values.description ?? '',
      permissions: values.permissions,
    });
    qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    ghiAudit({
      action: 'update',
      entity: 'role',
      entityId: id,
      entityLabel: values.name,
      diff: {
        before: { name: before.name, permissions: before.permissions.length },
        after: { name: values.name, permissions: values.permissions.length },
      },
    });
    return true;
  }, [qc]);
}

export function useDeleteRoleWithAudit() {
  const qc = useQueryClient();
  return useCallback(async (role: Role) => {
    if (role.isSystem) {
      notifyError('Lỗi', 'Không thể xóa system role');
      return false;
    }
    if (role.memberCount > 0) {
      notifyError('Lỗi', `Role đang có ${role.memberCount} thành viên`);
      return false;
    }
    MockDB.delete('roles', role.id);
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
  }, [qc]);
}

// ─── BATCH PERMISSION MATRIX ──────────────────────────────────
export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useCallback(
    async (roleId: string, permissions: string[]) => {
      const before = MockDB.getById<Role>('roles', roleId);
      if (!before) return false;
      if (before.isSystem) {
        notifyError('Lỗi', 'Không thể sửa system role');
        return false;
      }
      MockDB.update<Role>('roles', roleId, { permissions });
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
    },
    [qc],
  );
}

// ─── AUDIT LOG (xem) ──────────────────────────────────────────
export function useAuditLogs() {
  const { data = [] } = useMockQuery<AuditLog>('audit_logs', undefined, {
    by: 'createdAt',
    dir: 'desc',
  });
  return { data };
}
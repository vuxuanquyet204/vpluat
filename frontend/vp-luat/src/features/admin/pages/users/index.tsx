'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Shield,
  Mail,
  UserCog,
  LogOut,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  AdminPageHeader,
  SearchBar,
  FilterTabs,
  Pagination,
  ConfirmDialog,
  EmptyStateWithCta,
  Modal,
} from '@/features/admin/shared';
import { useCan, notifySuccess, notifyError } from '@/features/admin/lib';
import { useAdminAuth } from './hooks/use-admin-auth';
import { UsersTable } from './components/users-table';
import { UserForm } from './components/user-form';
import { RolesTable } from './components/roles-table';
import { RoleForm } from './components/role-form';
import { PermissionMatrix } from './components/permission-matrix';
import { ImpersonateDialog } from './components/impersonate-dialog';
import {
  useUsers,
  useRoles,
  useCreateUserFromValues,
  useUpdateUserFromValues,
  useDeleteUserWithAudit,
  useResetPassword,
  useToggleUserStatus,
  useCreateRoleFromValues,
  useUpdateRoleFromValues,
  useDeleteRoleWithAudit,
  useUpdateRolePermissions,
  useAuditLogs,
  ROLE_LABELS,
} from './hooks/use-users';
import type { AdminUser, Role, UserRole } from '@/features/admin/types';
import type { UserFormValues, RoleFormValues } from '@/features/admin/schema';

type Tab = 'users' | 'roles' | 'matrix' | 'audit';

export default function UsersPage() {
  const canRead = useCan('users.read');
  const canWrite = useCan('users.write');
  const canImpersonate = useCan('users.impersonate');
  const canDelete = useCan('users.write');
  const canAudit = useCan('audit.read');
  const { currentUser, effectiveUser, isImpersonating, startImpersonate, stopImpersonate } =
    useAdminAuth();

  if (!canRead) {
    return (
      <div className="admin-view">
        <AdminPageHeader title="Người dùng & Phân quyền" />
        <div
          className="admin-card"
          style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}
        >
          Bạn không có quyền xem module này.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Người dùng & Phân quyền"
        subtitle="Quản lý tài khoản, vai trò và ma trận quyền"
        actions={
          isImpersonating ? (
            <button
              type="button"
              onClick={stopImpersonate}
              className="action-btn action-btn--primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--warning, #D97706)',
              }}
            >
              <LogOut size={12} /> Thoát impersonate ({effectiveUser?.name})
            </button>
          ) : null
        }
      />

      {isImpersonating && (
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--warning-faint, #FEF3C7)',
            border: '1px solid var(--warning, #D97706)',
            borderRadius: 8,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.82rem',
            color: 'var(--warning, #B45309)',
          }}
        >
          <AlertTriangle size={16} />
          Bạn đang đăng nhập thay <strong>{effectiveUser?.name}</strong> ({effectiveUser?.email})
          dưới quyền <strong>{ROLE_LABELS[(effectiveUser?.role as UserRole) ?? 'staff']}</strong>.
          Mọi thao tác sẽ được ghi audit log.
        </div>
      )}

      <Tabs />
    </div>
  );
}

function Tabs() {
  const [tab, setTab] = useState<Tab>('users');
  const canAudit = useCan('audit.read');

  const tabs: Array<{ value: Tab; label: string; icon: React.ReactNode; show: boolean }> = [
    { value: 'users', label: 'Người dùng', icon: <UserCog size={12} />, show: true },
    { value: 'roles', label: 'Vai trò', icon: <Shield size={12} />, show: true },
    { value: 'matrix', label: 'Permission Matrix', icon: <Mail size={12} />, show: true },
    { value: 'audit', label: 'Audit log', icon: <Activity size={12} />, show: canAudit },
  ];
  const visible = tabs.filter((t) => t.show);

  return (
    <>
      <FilterTabs
        tabs={visible.map((t) => ({
          value: t.value,
          label: t.label,
          icon: t.icon,
        }))}
        activeValue={tab}
        onChange={(v) => setTab(v as Tab)}
      />
      <div style={{ height: 12 }} />
      {tab === 'users' && <UsersTab />}
      {tab === 'roles' && <RolesTab />}
      {tab === 'matrix' && <MatrixTab />}
      {tab === 'audit' && canAudit && <AuditTab />}
    </>
  );
}

// ─── USERS TAB ─────────────────────────────────────────────────
function UsersTab() {
  const canWrite = useCan('users.write');
  const canDelete = useCan('users.write');
  const canImpersonate = useCan('users.impersonate');
  const { data: users, counts } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUserFromValues();
  const updateUser = useUpdateUserFromValues();
  const deleteUser = useDeleteUserWithAudit();
  const resetPassword = useResetPassword();
  const toggleStatus = useToggleUserStatus();
  const { startImpersonate, currentUser, isImpersonating } = useAdminAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [confirmReset, setConfirmReset] = useState<AdminUser | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<AdminUser | null>(null);
  const LIMIT = 20;

  const filtered = useMemo(() => {
    let r = users;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== 'all') r = r.filter((u) => u.role === roleFilter);
    if (statusFilter !== 'all') r = r.filter((u) =>
      statusFilter === 'active' ? u.isActive : !u.isActive,
    );
    return r;
  }, [users, search, roleFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const roleTabs: Array<{ value: 'all' | UserRole; label: string; count: number }> = [
    { value: 'all', label: 'Tất cả', count: counts.total },
    { value: 'super_admin', label: 'Super Admin', count: counts.byRole.super_admin },
    { value: 'admin', label: 'Admin', count: counts.byRole.admin },
    { value: 'lawyer', label: 'Lawyer', count: counts.byRole.lawyer },
    { value: 'staff', label: 'Staff', count: counts.byRole.staff },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <FilterTabs
            tabs={roleTabs}
            activeValue={roleFilter}
            onChange={(v) => {
              setRoleFilter(v as typeof roleFilter);
              setPage(1);
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterTabs
              tabs={[
                { value: 'all', label: 'Tất cả', count: counts.total },
                { value: 'active', label: 'Hoạt động', count: counts.active },
                { value: 'inactive', label: 'Bị khóa', count: counts.inactive },
              ]}
              activeValue={statusFilter}
              onChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
            />
          </div>
        </div>
        {canWrite && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              className="action-btn action-btn--primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={12} /> Tạo người dùng
            </button>
          </div>
        )}
      </div>

      <div className="admin-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            {filtered.length} / {users.length} users
          </span>
        </div>

        {users.length === 0 ? (
          <EmptyStateWithCta
            title="Chưa có user nào"
            description="Tạo tài khoản đầu tiên cho đội ngũ admin."
            action={
              canWrite ? (
                <button
                  type="button"
                  className="action-btn action-btn--primary"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Tạo ngay
                </button>
              ) : null
            }
          />
        ) : (
          <UsersTable
            data={paginated}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onEdit={(u) => {
              setEditing(u);
              setFormOpen(true);
            }}
            onDelete={(u) => setConfirmDelete(u)}
            onResetPassword={(u) => setConfirmReset(u)}
            onToggleStatus={(u) => toggleStatus(u)}
            onImpersonate={(u) => setImpersonateTarget(u)}
            currentUserId={currentUser?.id ?? ''}
            canWrite={canWrite}
            canDelete={canDelete}
            canImpersonate={canImpersonate && !isImpersonating}
          />
        )}

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <UserForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={async (values) => {
          if (editing) {
            const ok = await updateUser(editing.id, values);
            if (ok) notifySuccess('Đã cập nhật người dùng');
          } else {
            const id = await createUser(values);
            if (id) notifySuccess('Đã tạo người dùng');
          }
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa người dùng"
        message={
          confirmDelete
            ? `Xóa "${confirmDelete.name}"? Hành động không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await deleteUser(confirmDelete);
          } catch (e) {
            notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
          } finally {
            setConfirmDelete(null);
          }
        }}
        onClose={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmReset)}
        title="Reset mật khẩu"
        message={
          confirmReset
            ? `Gửi email reset mật khẩu cho ${confirmReset.email}?`
            : ''
        }
        confirmLabel="Gửi email"
        cancelLabel="Hủy"
        variant="primary"
        onConfirm={async () => {
          if (!confirmReset) return;
          await resetPassword(confirmReset);
          setConfirmReset(null);
        }}
        onClose={() => setConfirmReset(null)}
      />

      <ImpersonateDialog
        isOpen={Boolean(impersonateTarget)}
        user={impersonateTarget}
        onConfirm={() => {
          if (impersonateTarget) {
            startImpersonate(impersonateTarget.id);
            setImpersonateTarget(null);
          }
        }}
        onClose={() => setImpersonateTarget(null)}
      />

      {void roles}
    </>
  );
}

// ─── ROLES TAB ─────────────────────────────────────────────────
function RolesTab() {
  const canWrite = useCan('users.write');
  const canDelete = useCan('users.write');
  const { data: roles } = useRoles();
  const createRole = useCreateRoleFromValues();
  const updateRole = useUpdateRoleFromValues();
  const deleteRole = useDeleteRoleWithAudit();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);
  const LIMIT = 20;

  const filtered = useMemo(() => {
    if (!search) return roles;
    const q = search.toLowerCase();
    return roles.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }, [roles, search]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 12,
        }}
      >
        {canWrite && (
          <button
            type="button"
            className="action-btn action-btn--primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={12} /> Tạo role
          </button>
        )}
      </div>

      <div className="admin-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Tìm role..."
          />
          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
            {filtered.length} / {roles.length} roles
          </span>
        </div>

        {roles.length === 0 ? (
          <EmptyStateWithCta
            title="Chưa có role nào"
            description="Tạo role đầu tiên để gán quyền cho user."
            action={
              canWrite ? (
                <button
                  type="button"
                  className="action-btn action-btn--primary"
                  onClick={() => {
                    setEditing(null);
                    setFormOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={12} /> Tạo ngay
                </button>
              ) : null
            }
          />
        ) : (
          <RolesTable
            data={paginated}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onEdit={(r) => {
              setEditing(r);
              setFormOpen(true);
            }}
            onDelete={(r) => setConfirmDelete(r)}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        )}

        <Pagination
          page={page}
          limit={LIMIT}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>

      <RoleForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={async (values: RoleFormValues) => {
          if (editing) {
            const ok = await updateRole(editing.id, values);
            if (ok) notifySuccess('Đã cập nhật role');
          } else {
            const id = await createRole(values);
            if (id) notifySuccess('Đã tạo role');
          }
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        title="Xóa role"
        message={
          confirmDelete
            ? `Xóa role "${confirmDelete.name}"? Hành động không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDelete) return;
          await deleteRole(confirmDelete);
          setConfirmDelete(null);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}

// ─── MATRIX TAB ────────────────────────────────────────────────
function MatrixTab() {
  const canWrite = useCan('users.write');
  const { data: roles } = useRoles();
  const updateRolePermissions = useUpdateRolePermissions();

  return (
    <>
      <div
        style={{
          padding: 10,
          background: 'var(--blue-faint, #DBEAFE)',
          border: '1px solid var(--blue, #2563EB)',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: '0.78rem',
          color: 'var(--blue, #1E40AF)',
        }}
      >
        ℹ Tick vào ô để cấp/thu hồi quyền. Cột hàng header có nút <strong>Lưu</strong> riêng cho mỗi role — chỉ lưu khi đã tick xong. System role không thể chỉnh qua matrix (vào <strong>Roles tab</strong> để tạo role mới).
      </div>
      <PermissionMatrix
        roles={roles}
        onSave={async (roleId, perms) => {
          if (!canWrite) {
            notifyError('Lỗi', 'Bạn không có quyền users.write');
            return false;
          }
          return updateRolePermissions(roleId, perms);
        }}
      />
    </>
  );
}

// ─── AUDIT TAB ─────────────────────────────────────────────────
function AuditTab() {
  const { data: logs } = useAuditLogs();
  const [filter, setFilter] = useState<'all' | 'impersonate' | 'user'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let r = logs;
    if (filter === 'impersonate') r = r.filter((l) => l.action === 'impersonate' || l.action === 'login');
    if (filter === 'user') r = r.filter((l) => l.entity === 'user' || l.entity === 'role');
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          (l.entityLabel?.toLowerCase().includes(q) ?? false) ||
          l.action.toLowerCase().includes(q),
      );
    }
    return r;
  }, [logs, filter, search]);

  const actionColor = (a: string): 'red' | 'blue' | 'green' | 'yellow' | 'gray' => {
    if (a === 'create') return 'green';
    if (a === 'delete') return 'red';
    if (a === 'update') return 'blue';
    if (a === 'impersonate') return 'red';
    if (a === 'login' || a === 'logout') return 'yellow';
    return 'gray';
  };

  return (
    <div className="admin-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <FilterTabs
          tabs={[
            { value: 'all', label: 'Tất cả', count: logs.length },
            {
              value: 'impersonate',
              label: 'Impersonate',
              count: logs.filter((l) => l.action === 'impersonate' || l.action === 'login').length,
            },
            {
              value: 'user',
              label: 'User/Role',
              count: logs.filter((l) => l.entity === 'user' || l.entity === 'role').length,
            },
          ]}
          activeValue={filter}
          onChange={(v) => setFilter(v as typeof filter)}
        />
        <SearchBar value={search} onChange={setSearch} placeholder="Tìm actor, action..." />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
          Chưa có audit log
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            maxHeight: '70vh',
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: 'var(--gray-50)' }}>
                <th style={th()}>Thời gian</th>
                <th style={th()}>Actor</th>
                <th style={th()}>Action</th>
                <th style={th()}>Entity</th>
                <th style={th()}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={td()}>
                    <span style={{ color: 'var(--gray-500)' }}>
                      {new Intl.DateTimeFormat('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(l.createdAt))}
                    </span>
                  </td>
                  <td style={td()}>
                    <strong>{l.actorName}</strong>
                  </td>
                  <td style={td()}>
                    <span
                      style={{
                        padding: '2px 8px',
                        background: 'var(--primary-faint, #EFF3F8)',
                        color: 'var(--primary)',
                        borderRadius: 999,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td style={td()}>
                    <div style={{ fontWeight: 600 }}>{l.entity}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
                      {l.entityLabel ?? l.entityId}
                    </div>
                  </td>
                  <td style={td()}>
                    {l.diff ? (
                      <code
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--gray-600)',
                          background: 'var(--gray-50)',
                          padding: '2px 4px',
                          borderRadius: 3,
                        }}
                      >
                        {Object.keys(l.diff).length} field(s)
                      </code>
                    ) : (
                      <span style={{ color: 'var(--gray-300)' }}>—</span>
                    )}
                    {void actionColor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function th(): React.CSSProperties {
  return {
    textAlign: 'left',
    padding: '8px 10px',
    borderBottom: '2px solid var(--gray-200)',
    fontWeight: 600,
  };
}
function td(): React.CSSProperties {
  return { padding: '6px 10px' };
}
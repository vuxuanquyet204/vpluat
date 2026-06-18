'use client';

import { type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useCan } from '@/features/admin/lib';
import type { Permission } from '@/features/admin/lib/rbac';

interface PermissionGateProps {
  permission: Permission | Permission[];
  /** Render this when user lacks permission. Default: hide children. */
  fallback?: ReactNode;
  /** Show inline lock badge instead of hiding. */
  showFallback?: boolean;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  fallback,
  showFallback = false,
  children,
}: PermissionGateProps) {
  const allowed = useCan(permission);
  if (allowed) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (!showFallback) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        background: 'var(--gray-100)',
        color: 'var(--gray-500)',
        borderRadius: 4,
        fontSize: '0.7rem',
        fontWeight: 600,
      }}
      title="Bạn không có quyền thực hiện hành động này"
    >
      <Lock size={11} /> Không có quyền
    </span>
  );
}

interface RequirePermissionProps {
  permission: Permission | Permission[];
  children: ReactNode;
  /** When false, render a read-only notice. */
  showNotice?: boolean;
}

export function RequirePermission({
  permission,
  children,
  showNotice = true,
}: RequirePermissionProps) {
  const allowed = useCan(permission);
  if (allowed) return <>{children}</>;
  if (!showNotice) return null;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        padding: 40,
        textAlign: 'center',
        color: 'var(--gray-500)',
      }}
      role="alert"
    >
      <Lock size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, color: 'var(--gray-700)' }}>
        Không có quyền truy cập
      </div>
      <div style={{ fontSize: '0.78rem' }}>
        Bạn cần quyền <code style={{ padding: '1px 4px', background: 'var(--gray-100)', borderRadius: 3 }}>
          {Array.isArray(permission) ? permission.join(', ') : permission}
        </code> để xem trang này.
      </div>
    </div>
  );
}
'use client';

import type { ReactNode } from 'react';
import { useCan, type Permission } from './rbac';

interface PermissionGateProps {
  permission: Permission | Permission[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const allowed = useCan(permission);
  return <>{allowed ? children : fallback}</>;
}

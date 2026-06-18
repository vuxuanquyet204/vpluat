/**
 * Audit log helper — ghi vào collection `audit_logs` trong MockDB.
 * Actor lấy từ currentUser (AdminAuth).
 */

'use client';

import { MockDB } from '../mock/db';
import { getCurrentUser } from './rbac';

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'status_change' | 'login' | 'logout'
  | 'impersonate' | 'assign' | 'publish' | 'send' | 'export' | 'restore' | 'cancel';

export interface AuditInput {
  action: AuditAction;
  entity: string;
  entityId: string;
  entityLabel?: string;
  diff?: { before: Record<string, unknown>; after: Record<string, unknown> };
}

export function ghiAudit(input: AuditInput): void {
  const user = getCurrentUser();
  MockDB.insert('audit_logs', {
    id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId: user?.id ?? 'system',
    actorName: user?.name ?? 'System',
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    diff: input.diff,
    createdAt: new Date().toISOString(),
  });
}

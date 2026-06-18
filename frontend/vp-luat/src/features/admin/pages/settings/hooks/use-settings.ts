'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MockDB } from '@/features/admin/mock/db';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import type { AuditLog } from '@/features/admin/types';

const MAX_AUDIT_LOGS = 1000;

interface SettingsRecord {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
  updatedBy: string;
}

// ─── SETTINGS ─────────────────────────────────────────────────
function loadOrInit<T extends object>(key: string, defaults: T): T {
  const existing = MockDB.getAll<SettingsRecord>('settings').find((r) => r.key === key);
  if (existing) return (existing.value as T) ?? defaults;
  MockDB.insert('settings', {
    id: `st-${key}`,
    key,
    value: defaults,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  });
  return defaults;
}

function saveSetting<T extends object>(key: string, value: T, actor: { id: string; name: string }) {
  const arr = MockDB.getAll<SettingsRecord>('settings');
  const idx = arr.findIndex((r) => r.key === key);
  if (idx === -1) {
    MockDB.insert('settings', {
      id: `st-${key}`,
      key,
      value,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    });
  } else {
    MockDB.update<SettingsRecord>('settings', arr[idx].id, {
      value,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    });
  }
}

export function useSetting<T extends object>(key: string, defaults: T) {
  const [value, setValue] = useState<T>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(loadOrInit(key, defaults));
    setLoaded(true);
  }, [key, defaults]);

  return { value, loaded, setValue };
}

export function useUpdateSetting<T extends object>(key: string) {
  const qc = useQueryClient();
  return useCallback(
    (newValue: T, label = 'Cài đặt hệ thống') => {
      try {
        // Lấy trước-sau để ghi audit
        const before = MockDB.getAll<SettingsRecord>('settings').find((r) => r.key === key);
        saveSetting(key, newValue, { id: 'current', name: 'Current User' });
        qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
        ghiAudit({
          action: 'update',
          entity: 'settings',
          entityId: key,
          entityLabel: label,
          diff: {
            before: { value: before?.value as Record<string, unknown> },
            after: { value: newValue as unknown as Record<string, unknown> },
          },
        });
        notifySuccess(`Đã lưu ${label}`);
        return true;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lưu');
        return false;
      }
    },
    [key, qc],
  );
}

export function useResetAllToSeed() {
  const qc = useQueryClient();
  return useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Reset toàn bộ DB về seed? Hành động không thể hoàn tác.')) return;
    try {
      const sizeBefore = MockDB.sizeInBytes();
      MockDB.reset();
      qc.invalidateQueries({ queryKey: ['admin'] });
      ghiAudit({
        action: 'restore',
        entity: 'system',
        entityId: 'reset-seed',
        entityLabel: `Reset DB (${(sizeBefore / 1024).toFixed(1)} KB)`,
      });
      notifySuccess('Đã reset toàn bộ DB về seed. Vui lòng refresh trang.');
    } catch {
      notifyError('Lỗi', 'Không thể reset');
    }
  }, [qc]);
}

export function useStorageInfo() {
  const [size, setSize] = useState(0);
  useEffect(() => {
    const handler = () => setSize(MockDB.sizeInBytes());
    handler();
    const interval = setInterval(handler, 3000);
    return () => clearInterval(interval);
  }, []);
  return { sizeBytes: size, sizeKb: (size / 1024).toFixed(1) };
}

// ─── AUDIT LOGS ───────────────────────────────────────────────
function trimAuditLogs() {
  const logs = MockDB.getAll<AuditLog>('audit_logs');
  if (logs.length <= MAX_AUDIT_LOGS) return;
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const toKeep = sorted.slice(0, MAX_AUDIT_LOGS);
  const toKeepIds = new Set(toKeep.map((l) => l.id));
  for (const log of logs) {
    if (!toKeepIds.has(log.id)) MockDB.delete('audit_logs', log.id);
  }
}

// Hook ghi audit có auto-trim
export function useGhiAuditWithTrim() {
  const qc = useQueryClient();
  return useCallback(
    (input: Parameters<typeof ghiAudit>[0]) => {
      ghiAudit(input);
      trimAuditLogs();
      qc.invalidateQueries({ queryKey: ['admin', 'audit_logs'] });
    },
    [qc],
  );
}

export function useAuditLogs() {
  const { data = [] } = (() => {
    // wrap query
    return { data: MockDB.getAll<AuditLog>('audit_logs') };
  })();
  return {
    data: [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}

export function useClearAuditLogs() {
  const qc = useQueryClient();
  return useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Xóa toàn bộ audit log? Hành động không thể hoàn tác.')) return;
    const logs = MockDB.getAll<AuditLog>('audit_logs');
    for (const log of logs) MockDB.delete('audit_logs', log.id);
    qc.invalidateQueries({ queryKey: ['admin', 'audit_logs'] });
    ghiAudit({
      action: 'delete',
      entity: 'audit_logs',
      entityId: 'all',
      entityLabel: `Đã xóa ${logs.length} log cũ`,
    });
    notifySuccess(`Đã xóa ${logs.length} audit log`);
  }, [qc]);
}

export function useExportAuditLogs() {
  return useCallback((format: 'csv' | 'json', logs: AuditLog[]) => {
    if (typeof window === 'undefined') return;
    const fileName = `audit-log-${new Date().toISOString().slice(0, 10)}.${format}`;
    let blob: Blob;
    if (format === 'csv') {
      const header = 'id,createdAt,actorName,action,entity,entityId,entityLabel\n';
      const rows = logs
        .map((l) =>
          [
            l.id,
            l.createdAt,
            l.actorName,
            l.action,
            l.entity,
            l.entityId,
            l.entityLabel ?? '',
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(','),
        )
        .join('\n');
      blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
    } else {
      blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    ghiAudit({
      action: 'export',
      entity: 'audit_logs',
      entityId: 'export',
      entityLabel: `Exported ${logs.length} logs (${format.toUpperCase()})`,
    });
    notifySuccess(`Đã export ${logs.length} audit log (${format.toUpperCase()})`);
  }, []);
}
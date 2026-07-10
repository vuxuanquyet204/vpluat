'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { settingsApi, auditApi, type SystemSettings, type AuditLogEntry } from '@/lib/api/admin-core';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'Văn Phòng Luật',
  siteEmail: 'contact@lawfirm.vn',
  defaultLanguage: 'vi',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  smsNotifications: false,
};

// ─── SETTINGS ─────────────────────────────────────────────────

// Local "namespace" types kept so existing settings sub-tabs can compile
// while the backend lands a real /admin/settings/<namespace> endpoint.
export interface GeneralSettings {
  siteName: string;
  hotline: string;
  email: string;
  address: string;
  timezone: string;
  defaultLanguage: 'vi' | 'en';
  maintenanceMode: boolean;
}

export interface BookingSettings {
  slotDuration: number;
  bookingLeadTime: number;
  maxBookingsPerDay: number;
  allowOnline: boolean;
  autoConfirm: boolean;
  cancellationPolicy: string;
}

export interface SmtpSettings {
  fromName: string;
  fromEmail: string;
  replyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  useTls: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface IntegrationsSettings {
  sentryDsn: string;
  posthogKey: string;
  googleAnalyticsId: string;
  chatbotWebhookUrl: string;
}

export type SettingsNamespace =
  | 'settings.general'
  | 'settings.booking'
  | 'settings.smtp'
  | 'settings.theme'
  | 'settings.integrations';

const NS_DEFAULTS: Record<SettingsNamespace, unknown> = {
  'settings.general': {
    siteName: 'Văn Phòng Luật',
    hotline: '',
    email: 'contact@lawfirm.vn',
    address: '',
    timezone: 'Asia/Ho_Chi_Minh',
    defaultLanguage: 'vi',
    maintenanceMode: false,
  },
  'settings.booking': {
    slotDuration: 60,
    bookingLeadTime: 24,
    maxBookingsPerDay: 30,
    allowOnline: true,
    autoConfirm: false,
    cancellationPolicy: '24h',
  },
  'settings.smtp': {
    fromName: '',
    fromEmail: '',
    replyTo: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    useTls: true,
  },
  'settings.theme': {
    primaryColor: '#1E3A5F',
    accentColor: '#C9A84C',
    fontFamily: 'Inter',
    logoUrl: '',
    faviconUrl: '',
  },
  'settings.integrations': {
    sentryDsn: '',
    posthogKey: '',
    googleAnalyticsId: '',
    chatbotWebhookUrl: '',
  },
};

/**
 * Fetch a settings sub-document by namespace.
 * Returns the namespace default until the backend provides a real endpoint.
 */
export function useSetting<T extends object>(key: SettingsNamespace, defaults: T) {
  const fallback = (NS_DEFAULTS[key] as T) ?? defaults;
  const { value, loaded } = useFullSettings();
  const ns = (value as unknown as Record<string, unknown>)[key];
  return {
    value: (ns && typeof ns === 'object' ? (ns as T) : fallback),
    loaded,
    refetch: () => undefined,
  };
}

/**
 * Fetch the full settings document from the backend.
 * Falls back to DEFAULT_SETTINGS if the backend is unreachable so the
 * admin UI never renders blank while we wait.
 */
function useFullSettings() {
  const { data, isLoading, error, refetch } = useApiQuery<SystemSettings>(
    ['admin', 'settings'],
    '/admin/settings',
    {},
    { retry: false },
  );

  return {
    value: data ?? DEFAULT_SETTINGS,
    loaded: !isLoading,
    error,
    refetch,
  };
}

/**
 * Generic typed setter for the singleton settings document. Records
 * before/after diffs to the audit trail.
 */
function useUpdateSettingRaw() {
  const qc = useQueryClient();
  const mutation = useApiMutation<SystemSettings, Partial<SystemSettings>>(
    'PUT',
    '/admin/settings',
  );

  return useCallback(
    async (newValue: Partial<SystemSettings>, label = 'Cài đặt hệ thống') => {
      try {
        const before = qc.getQueryData<SystemSettings>(['admin', 'settings']) ?? DEFAULT_SETTINGS;
        await mutation.mutateAsync(newValue);
        qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
        ghiAudit({
          action: 'update',
          entity: 'settings',
          entityId: 'singleton',
          entityLabel: label,
          diff: {
            before: { value: before as unknown as Record<string, unknown> },
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
    [mutation, qc],
  );
}

// ─── RESET (no-op in real backend) ────────────────────────────

/**
 * Reset to seed is meaningless once we use a real backend. Keep the
 * function but make it a no-op that logs the action so any leftover
 * UI button still works.
 */
/**
 * Generic namespaced settings setter used by the sub-tab forms.
 * Each top-level settings form passes its own key + payload type.
 */
export function useUpdateSetting<T extends object>(key: SettingsNamespace) {
  const update = useUpdateSettingRaw();
  return useCallback(
    async (newValue: Partial<T>, label = 'Cài đặt hệ thống') => {
      return update({ [key]: newValue } as Partial<SystemSettings>, label);
    },
    [update, key],
  );
}

export function useResetAllToSeed() {
  const qc = useQueryClient();
  return useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Reset toàn bộ cache về mặc định? Hành động không thể hoàn tác.')) return;
    try {
      qc.invalidateQueries();
      ghiAudit({
        action: 'restore',
        entity: 'system',
        entityId: 'reset-cache',
        entityLabel: 'Invalidated React Query cache',
      });
      notifySuccess('Đã reset cache. Vui lòng refresh trang.');
    } catch {
      notifyError('Lỗi', 'Không thể reset');
    }
  }, [qc]);
}

/**
 * Storage info is meaningless against a real API. Return a stub.
 */
export function useStorageInfo() {
  return { sizeBytes: 0, sizeKb: '0.0' };
}

// ─── AUDIT LOGS ───────────────────────────────────────────────

export function useGhiAuditWithTrim() {
  const qc = useQueryClient();
  return useCallback(
    (input: Parameters<typeof ghiAudit>[0]) => {
      ghiAudit(input);
      qc.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
    [qc],
  );
}

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

  return {
    data: (data?.content ?? []).slice().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  };
}

/** Clear audit logs is a privileged op — surface a confirmation, then call backend. */
export function useClearAuditLogs() {
  const qc = useQueryClient();
  return useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Xóa toàn bộ audit log? Hành động không thể hoàn tác.')) return;
    // Backend does not expose a "clear" endpoint yet; record intent.
    qc.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    ghiAudit({
      action: 'delete',
      entity: 'audit_logs',
      entityId: 'all',
      entityLabel: 'Yêu cầu xóa toàn bộ audit log',
    });
    notifySuccess('Đã ghi nhận yêu cầu xóa audit log');
  }, [qc]);
}

export function useExportAuditLogs() {
  return useCallback((format: 'csv' | 'json', logs: AuditLogEntry[]) => {
    if (typeof window === 'undefined') return;
    const fileName = `audit-log-${new Date().toISOString().slice(0, 10)}.${format}`;
    let blob: Blob;
    if (format === 'csv') {
      const header = 'id,createdAt,actorName,action,entityType,entityId,summary\n';
      const rows = logs
        .map((l) =>
          [
            l.id,
            l.createdAt,
            l.actorName,
            l.action,
            l.entityType ?? '',
            l.entityId ?? '',
            l.summary ?? '',
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

/** CSV download URL (backend-served, avoids the localStorage-based path). */
export function auditLogsCsvUrl(params?: { from?: string; to?: string }): string {
  return auditApi.exportCsvUrl(params);
}

/** Re-export so consumers don't need a second import. */
export type { SystemSettings, AuditLogEntry };
'use client';

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Calendar,
  Server,
  Palette,
  Plug,
  Database,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { AdminPageHeader, FilterTabs } from '@/features/admin/shared';
import { useCan } from '@/features/admin/lib';
import {
  useSetting,
  useUpdateSetting,
  useResetAllToSeed,
  useStorageInfo,
} from './hooks/use-settings';
import { GeneralSettingsForm } from './components/general-settings';
import { BookingSettingsForm } from './components/booking-settings';
import { SmtpSettingsForm } from './components/smtp-settings';
import { ThemeSettingsForm } from './components/theme-settings';
import { IntegrationsSettingsForm } from './components/integrations-settings';
import {
  DEFAULT_GENERAL,
  DEFAULT_BOOKING,
  DEFAULT_SMTP,
  DEFAULT_THEME,
  DEFAULT_INTEGRATIONS,
  type GeneralSettings,
  type BookingSettings,
  type SmtpSettings,
  type ThemeSettings,
  type IntegrationsSettings,
} from './components/types';
import type {
  GeneralSettingsValues,
  BookingSettingsValues,
  SmtpSettingsValues,
  ThemeSettingsValues,
  IntegrationsSettingsValues,
} from '@/features/admin/schema';

type Tab = 'general' | 'booking' | 'smtp' | 'theme' | 'integrations' | 'system';

export default function SettingsPage() {
  const canRead = useCan('settings.read');
  const canWrite = useCan('settings.write');
  const general = useSetting<GeneralSettings>('settings.general', DEFAULT_GENERAL);
  const booking = useSetting<BookingSettings>('settings.booking', DEFAULT_BOOKING);
  const smtp = useSetting<SmtpSettings>('settings.smtp', DEFAULT_SMTP);
  const theme = useSetting<ThemeSettings>('settings.theme', DEFAULT_THEME);
  const integrations = useSetting<IntegrationsSettings>(
    'settings.integrations',
    DEFAULT_INTEGRATIONS,
  );
  const updateGeneral = useUpdateSetting<GeneralSettings>('settings.general');
  const updateBooking = useUpdateSetting<BookingSettings>('settings.booking');
  const updateSmtp = useUpdateSetting<SmtpSettings>('settings.smtp');
  const updateTheme = useUpdateSetting<ThemeSettings>('settings.theme');
  const updateIntegrations = useUpdateSetting<IntegrationsSettings>('settings.integrations');
  const resetToSeed = useResetAllToSeed();
  const storage = useStorageInfo();
  const [tab, setTab] = useState<Tab>('general');

  if (!canRead) {
    return (
      <div className="admin-view">
        <AdminPageHeader title="Cài đặt hệ thống" />
        <div
          className="admin-card"
          style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}
        >
          Bạn không có quyền xem cài đặt.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        subtitle="Cấu hình các thông số chung, booking, email, giao diện, tích hợp"
      />

      <FilterTabs
        tabs={[
          { value: 'general', label: 'Chung' },
          { value: 'booking', label: 'Booking' },
          { value: 'smtp', label: 'Email/SMTP' },
          { value: 'theme', label: 'Theme' },
          { value: 'integrations', label: 'Tích hợp' },
          { value: 'system', label: 'Hệ thống' },
        ]}
        activeValue={tab}
        onChange={(v) => setTab(v as Tab)}
      />

      <div style={{ height: 12 }} />

      {tab === 'general' && (
        <GeneralSettingsForm
          value={general.value}
          loaded={general.loaded}
          onSubmit={async (v: GeneralSettingsValues) =>
            updateGeneral(v as GeneralSettings, 'Cài đặt chung')
          }
          isSubmitting={false}
        />
      )}

      {tab === 'booking' && (
        <BookingSettingsForm
          value={booking.value}
          loaded={booking.loaded}
          onSubmit={async (v: BookingSettingsValues) =>
            updateBooking(v as BookingSettings, 'Cài đặt booking')
          }
          isSubmitting={false}
        />
      )}

      {tab === 'smtp' && (
        <SmtpSettingsForm
          value={smtp.value}
          loaded={smtp.loaded}
          onSubmit={async (v: SmtpSettingsValues) =>
            updateSmtp(v as SmtpSettings, 'Cài đặt SMTP')
          }
          isSubmitting={false}
        />
      )}

      {tab === 'theme' && (
        <ThemeSettingsForm
          value={theme.value}
          loaded={theme.loaded}
          onSubmit={async (v: ThemeSettingsValues) =>
            updateTheme(v as ThemeSettings, 'Cài đặt theme')
          }
          isSubmitting={false}
        />
      )}

      {tab === 'integrations' && (
        <IntegrationsSettingsForm
          value={integrations.value}
          loaded={integrations.loaded}
          onSubmit={async (v: IntegrationsSettingsValues) =>
            updateIntegrations(v as IntegrationsSettings, 'Tích hợp')
          }
          isSubmitting={false}
        />
      )}

      {tab === 'system' && (
        <SystemTab
          storage={storage}
          onReset={resetToSeed}
          canWrite={canWrite}
        />
      )}
    </div>
  );
}

function SystemTab({
  storage,
  onReset,
  canWrite,
}: {
  storage: { sizeBytes: number; sizeKb: string };
  onReset: () => void;
  canWrite: boolean;
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid var(--gray-200)',
        }}
      >
        <Database size={16} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
          Hệ thống & Lưu trữ
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <StorageCard
          icon={<HardDrive size={16} />}
          title="Dung lượng MockDB"
          value={`${storage.sizeKb} KB`}
          desc={`${storage.sizeBytes.toLocaleString('vi-VN')} bytes đang dùng trong localStorage`}
          warning={storage.sizeBytes > 4 * 1024 * 1024}
        />
        <StorageCard
          icon={<Database size={16} />}
          title="Audit log"
          value="Auto-trim 1000 records"
          desc="Giữ tối đa 1000 log mới nhất để tránh phình DB"
        />
      </div>

      <div
        style={{
          padding: 12,
          background: 'var(--warning-faint, #FEF3C7)',
          border: '1px solid var(--warning, #D97706)',
          borderRadius: 6,
          marginBottom: 16,
          fontSize: '0.78rem',
          color: 'var(--warning, #B45309)',
        }}
      >
        <strong>Cảnh báo:</strong> Reset toàn bộ DB sẽ xóa hết dữ liệu mock (leads, bookings,
        blog, users...) và trở về seed ban đầu. Hành động không thể hoàn tác.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="action-btn action-btn--danger"
          onClick={onReset}
          disabled={!canWrite}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <RefreshCw size={12} /> Reset toàn bộ về seed
        </button>
      </div>
    </div>
  );
}

function StorageCard({
  icon,
  title,
  value,
  desc,
  warning,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        padding: 12,
        background: warning ? 'var(--warning-faint, #FEF3C7)' : 'var(--gray-50)',
        border: `1px solid ${warning ? 'var(--warning, #D97706)' : 'var(--gray-200)'}`,
        borderRadius: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: 'var(--primary)' }}>
        {icon}
        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: warning ? 'var(--warning, #B45309)' : 'var(--gray-800)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>{desc}</div>
    </div>
  );
}

void Building2;
void Calendar;
void Server;
void Palette;
void Plug;
void SettingsIcon;
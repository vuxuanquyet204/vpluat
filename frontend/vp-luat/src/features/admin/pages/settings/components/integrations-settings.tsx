'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plug, Save, ExternalLink, Activity, BarChart3, MessageSquare } from 'lucide-react';
import { FormFieldInput } from '@/features/admin/components';
import {
  integrationsSettingsSchema,
  type IntegrationsSettingsValues,
} from '@/features/admin/schema';
import type { IntegrationsSettings } from './types';

interface Props {
  value: IntegrationsSettings;
  loaded: boolean;
  onSubmit: (v: IntegrationsSettingsValues) => Promise<boolean> | boolean;
  isSubmitting?: boolean;
}

const INTEGRATIONS: Array<{
  field: keyof IntegrationsSettingsValues;
  label: string;
  placeholder: string;
  desc: string;
  icon: React.ReactNode;
  docsUrl?: string;
}> = [
  {
    field: 'sentryDsn',
    label: 'Sentry DSN',
    placeholder: 'https://...@sentry.io/123',
    desc: 'Error tracking & performance monitoring',
    icon: <Activity size={14} />,
    docsUrl: 'https://docs.sentry.io',
  },
  {
    field: 'posthogKey',
    label: 'PostHog API Key',
    placeholder: 'phc_...',
    desc: 'Product analytics & feature flags',
    icon: <BarChart3 size={14} />,
    docsUrl: 'https://posthog.com/docs',
  },
  {
    field: 'googleAnalyticsId',
    label: 'Google Analytics ID',
    placeholder: 'G-XXXXXXXXXX',
    desc: 'Web analytics tracking',
    icon: <BarChart3 size={14} />,
    docsUrl: 'https://analytics.google.com',
  },
  {
    field: 'chatbotWebhookUrl',
    label: 'Chatbot Webhook URL',
    placeholder: 'https://hooks.zapier.com/...',
    desc: 'Webhook để forward tin nhắn chatbot',
    icon: <MessageSquare size={14} />,
  },
];

export function IntegrationsSettingsForm({ value, loaded, onSubmit, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<IntegrationsSettingsValues>({
    resolver: zodResolver(integrationsSettingsSchema),
    defaultValues: value,
  });

  useEffect(() => {
    if (loaded) reset(value);
  }, [loaded, value, reset]);

  const values = watch();

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v))}
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
        <Plug size={16} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
          Tích hợp bên thứ ba
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {INTEGRATIONS.map((intg) => {
          const isConfigured = Boolean(values[intg.field]);
          return (
            <div
              key={intg.field}
              style={{
                padding: 12,
                background: isConfigured ? 'var(--success-faint, #D1FAE5)' : 'var(--gray-50)',
                border: `1px solid ${isConfigured ? 'var(--success, #10B981)' : 'var(--gray-200)'}`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: isConfigured ? 'var(--success, #10B981)' : 'var(--gray-300)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {intg.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>
                  {intg.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                  {intg.desc}
                </div>
                <FormFieldInput
                  placeholder={intg.placeholder}
                  {...register(intg.field)}
                  error={errors[intg.field]?.message}
                />
              </div>
              {intg.docsUrl && (
                <a
                  href={intg.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                  }}
                >
                  Docs <ExternalLink size={11} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          paddingTop: 16,
          borderTop: '1px solid var─gray-200)',
        }}
      >
        <button
          type="button"
          className="action-btn"
          onClick={() => reset(value)}
          disabled={!isDirty || isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="action-btn action-btn--primary"
          disabled={!isDirty || isSubmitting}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Save size={12} /> {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </form>
  );
}
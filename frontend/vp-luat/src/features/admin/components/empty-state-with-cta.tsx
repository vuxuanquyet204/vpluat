'use client';

import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyStateWithCta({
  icon,
  title = 'Chưa có dữ liệu',
  description = 'Bắt đầu bằng cách tạo bản ghi mới.',
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--gray-400)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'var(--gray-50)',
          color: 'var(--gray-400)',
          marginBottom: 12,
        }}
        aria-hidden="true"
      >
        {icon ?? <Inbox size={24} strokeWidth={1.5} />}
      </div>
      <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--gray-700)', fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ margin: '6px 0 16px', fontSize: '0.82rem', color: 'var(--gray-400)' }}>
        {description}
      </p>
      {action}
    </div>
  );
}

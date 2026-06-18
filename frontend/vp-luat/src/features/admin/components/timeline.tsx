'use client';

import type { ReactNode } from 'react';

interface TimelineProps {
  items: Array<{
    id: string;
    icon?: ReactNode;
    iconBg?: string;
    iconColor?: string;
    title: ReactNode;
    description?: ReactNode;
    time?: ReactNode;
  }>;
  emptyMessage?: string;
}

export function Timeline({ items, emptyMessage = 'Chưa có hoạt động nào' }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ol
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
    >
      {items.map((item, idx) => (
        <li
          key={item.id}
          style={{
            position: 'relative',
            paddingLeft: 36,
            paddingBottom: idx === items.length - 1 ? 0 : 16,
          }}
        >
          {idx < items.length - 1 && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 14,
                top: 28,
                bottom: -4,
                width: 2,
                background: 'var(--gray-200)',
              }}
            />
          )}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 2,
              top: 2,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: item.iconBg ?? 'var(--gray-100)',
              color: item.iconColor ?? 'var(--gray-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            {item.icon}
          </span>
          <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', lineHeight: 1.4 }}>
            {item.title}
          </div>
          {item.description && (
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
              {item.description}
            </div>
          )}
          {item.time && (
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>
              {item.time}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

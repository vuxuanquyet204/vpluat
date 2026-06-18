'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardItem {
  label: string;
  value: ReactNode;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  iconVariant?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  isLoading?: boolean;
}

const ICON_BG: Record<NonNullable<StatCardItem['iconVariant']>, { bg: string; color: string }> = {
  blue: { bg: '#EFF6FF', color: '#2563EB' },
  green: { bg: '#ECFDF5', color: '#059669' },
  yellow: { bg: '#FFFBEB', color: '#D97706' },
  purple: { bg: '#F5F3FF', color: '#7C3AED' },
  red: { bg: '#FEF2F2', color: '#DC2626' },
};

export function StatCardGrid({ items }: { items: StatCardItem[] }) {
  return (
    <div className="stats-grid">
      {items.map((item, idx) => {
        const isUp = (item.change ?? 0) >= 0;
        const iconStyle = item.iconVariant ? ICON_BG[item.iconVariant] : null;
        return (
          <div key={idx} className="stat-card">
            <div className="stat-card__header">
              {item.icon ? (
                <div
                  className="stat-card__icon"
                  style={iconStyle ? { background: iconStyle.bg, color: iconStyle.color } : undefined}
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
              ) : (
                <div className="stat-card__icon stat-card__icon--blue" />
              )}
              {item.change !== undefined && (
                <span
                  className={`stat-card__trend ${isUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}
                >
                  {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {isUp ? '+' : ''}
                  {item.change}
                </span>
              )}
            </div>
            {item.isLoading ? (
              <div
                style={{
                  height: 32,
                  background: 'var(--gray-100)',
                  borderRadius: 6,
                  marginBottom: 6,
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
                aria-label="Đang tải"
              />
            ) : (
              <div className="stat-card__value">{item.value}</div>
            )}
            <div className="stat-card__label">{item.label}</div>
            {item.changeLabel && <div className="stat-card__sub">{item.changeLabel}</div>}
          </div>
        );
      })}
    </div>
  );
}

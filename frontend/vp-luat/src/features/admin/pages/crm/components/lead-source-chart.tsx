'use client';

import { useMemo } from 'react';
import { DonutChart } from '@/features/admin/shared';
import type { LeadSource, DonutSegment } from '@/features/admin/types';

const SOURCE_COLORS: Record<LeadSource, string> = {
  facebook: '#2563EB',
  google_ads: '#D97706',
  organic: '#059669',
  chatbot: '#7C3AED',
  referral: '#C9A84C',
  other: '#9CA3AF',
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  organic: 'Tự nhiên',
  chatbot: 'Chatbot',
  referral: 'Giới thiệu',
  other: 'Khác',
};

interface LeadSourceChartProps {
  sourceCounts: Record<string, number>;
}

export function LeadSourceChart({ sourceCounts }: LeadSourceChartProps) {
  const segments = useMemo<DonutSegment[]>(() => {
    const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return (Object.entries(sourceCounts) as [LeadSource, number][])
      .filter(([, v]) => v > 0)
      .map(([src, count]) => ({
        label: SOURCE_LABELS[src],
        value: count,
        percentage: Math.round((count / total) * 100),
        color: SOURCE_COLORS[src],
      }))
      .sort((a, b) => b.value - a.value);
  }, [sourceCounts]);

  if (segments.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
        Chưa có dữ liệu
      </div>
    );
  }

  return <DonutChart segments={segments} />;
}

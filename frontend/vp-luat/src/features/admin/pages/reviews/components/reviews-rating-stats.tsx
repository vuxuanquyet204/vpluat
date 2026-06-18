'use client';

import { Star } from 'lucide-react';
import type { RatingBreakdown } from '../hooks/use-reviews';

interface ReviewsRatingStatsProps {
  breakdown: RatingBreakdown[];
  average: number;
  total: number;
}

const BAR_COLORS = ['#DC2626', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];

export function ReviewsRatingStats({ breakdown, average, total }: ReviewsRatingStatsProps) {
  return (
    <div className="admin-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-800)' }}>
          {average.toFixed(1)}
        </span>
        <Star size={20} fill="#F59E0B" stroke="#F59E0B" />
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>/ 5.0</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
          {total} đã duyệt
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {breakdown.map((b, i) => (
          <div
            key={b.stars}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}
          >
            <span
              style={{
                width: 28,
                fontWeight: 600,
                color: 'var(--gray-700)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {b.stars} <Star size={9} fill="#F59E0B" stroke="#F59E0B" />
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: 'var(--gray-100)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${b.percentage}%`,
                  height: '100%',
                  background: BAR_COLORS[i] ?? '#6B7280',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <span style={{ minWidth: 24, textAlign: 'right', color: 'var(--gray-600)' }}>
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
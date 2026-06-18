'use client';

import { useMemo } from 'react';
import { Eye, TrendingUp, MousePointerClick, Activity, Trophy } from 'lucide-react';
import type { LandingPage } from '@/features/admin/types';

interface LandingPageAnalyticsProps {
  page: LandingPage;
  allVariants?: LandingPage[];
}

export function LandingPageAnalytics({ page, allVariants }: LandingPageAnalyticsProps) {
  const stats = useMemo(
    () => ({
      views: page.analytics?.views ?? 0,
      conversions: page.analytics?.conversions ?? 0,
      ctr: page.analytics?.ctr ?? 0,
      bounce: page.analytics?.bounceRate ?? 0,
    }),
    [page.analytics],
  );

  const dailyMax = useMemo(
    () => Math.max(1, ...(page.analytics?.dailyViews ?? []).map((d) => d.views)),
    [page.analytics?.dailyViews],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <StatCard
          icon={<Eye size={12} />}
          label="Views"
          value={stats.views.toLocaleString('vi-VN')}
          color="var(--primary)"
        />
        <StatCard
          icon={<TrendingUp size={12} />}
          label="Conversions"
          value={stats.conversions.toLocaleString('vi-VN')}
          color="var(--success, #10B981)"
        />
        <StatCard
          icon={<MousePointerClick size={12} />}
          label="CTR"
          value={`${stats.ctr.toFixed(1)}%`}
          color="var(--blue, #2563EB)"
        />
        <StatCard
          icon={<Activity size={12} />}
          label="Bounce"
          value={`${stats.bounce.toFixed(0)}%`}
          color="var(--warning, #D97706)"
        />
      </div>

      {(page.analytics?.dailyViews ?? []).length > 0 && (
        <div
          style={{
            padding: 12,
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--gray-800)',
              marginBottom: 10,
            }}
          >
            Views 7 ngày gần nhất
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
            {(page.analytics?.dailyViews ?? []).map((d) => (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${(d.views / dailyMax) * 100}%`,
                    background: 'var(--primary, #1E3A5F)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 4,
                    transition: 'height 0.3s ease',
                  }}
                  title={`${d.views} views, ${d.conversions} conv`}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', marginTop: 4 }}>
                  {d.date.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allVariants && allVariants.length > 1 && (
        <div
          style={{
            padding: 12,
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--gray-800)',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Trophy size={12} color="var(--warning, #D97706)" /> A/B Test
          </div>
          {(() => {
            const total = allVariants.reduce(
              (sum, v) => sum + (v.analytics?.conversions ?? 0),
              0,
            );
            const winner = allVariants.reduce<LandingPage | null>((best, v) => {
              if (!best) return v;
              return (v.analytics?.ctr ?? 0) > (best.analytics?.ctr ?? -1) ? v : best;
            }, null);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {allVariants.map((v) => {
                  const pct = total > 0 ? ((v.analytics?.conversions ?? 0) / total) * 100 : 0;
                  const isWinner = v.id === winner?.id;
                  return (
                    <div
                      key={v.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 80px',
                        gap: 8,
                        alignItems: 'center',
                        padding: 6,
                        background: isWinner ? 'var(--success-faint, #D1FAE5)' : 'transparent',
                        borderRadius: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                        }}
                      >
                        Var {v.variantLabel ?? 'A'}
                      </span>
                      <div
                        style={{
                          height: 12,
                          background: 'var(--gray-100)',
                          borderRadius: 6,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: isWinner ? 'var(--success, #10B981)' : 'var(--blue, #2563EB)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', textAlign: 'right' }}>
                        {pct.toFixed(1)}%
                        {isWinner && ' 🏆'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 10,
        background: 'white',
        border: '1px solid var(--gray-200)',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--gray-500)',
          fontSize: '0.7rem',
          marginBottom: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
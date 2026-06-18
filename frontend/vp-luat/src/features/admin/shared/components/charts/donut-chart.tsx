import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { DonutSegment } from '@/features/admin/types';

interface DonutChartProps {
  segments: DonutSegment[];
  className?: string;
  size?: number;
}

export function DonutChart({ segments, className = '', size = 160 }: DonutChartProps) {
  return (
    <div className={`admin-card ${className}`} style={{ padding: 20 }}>
      <div className="admin-card__header">
        <div className="admin-card__title">Nguồn Leads</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={size * 0.225}
              outerRadius={size * 0.375}
              paddingAngle={2}
              strokeWidth={0}
            >
              {segments.map((seg, i) => (
                <Cell key={`${i}-${seg.label}`} fill={seg.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [String(value ?? 0), '']}
              contentStyle={{
                background: 'var(--white, #fff)',
                border: '1px solid var(--gray-200, #e5e7eb)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {segments.map((seg, i) => (
            <div key={`${i}-${seg.label}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600, #4b5563)', flex: 1 }}>
                {seg.label}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #1E3A5F)' }}>
                {seg.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

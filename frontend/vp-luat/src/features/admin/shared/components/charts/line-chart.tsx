import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/features/admin/types';

interface LineChartProps {
  data: ChartDataPoint[];
  className?: string;
  height?: number;
}

const VISIT_COLOR = '#2563EB';
const LEAD_COLOR = '#C9A84C';

export function LineChart({ data, className = '', height = 220 }: LineChartProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        visitsLabel: item.visits.toLocaleString('vi-VN'),
        leadsLabel: item.leads.toLocaleString('vi-VN'),
      })),
    [data],
  );

  return (
    <div className={`admin-card ${className}`} style={{ padding: 20 }}>
      <div className="admin-card__header">
        <div className="admin-card__title">Lượt truy cập & Leads</div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="4 3" stroke="var(--gray-200, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--gray-400, #9ca3af)' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--gray-400, #9ca3af)' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            formatter={(value, name) => [
              typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value ?? ''),
              String(name ?? ''),
            ]}
            labelFormatter={(label) => String(label ?? '')}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={28}
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 11, color: 'var(--gray-500, #6b7280)' }}
          />
          <Line
            type="monotone"
            dataKey="visits"
            name="Truy cập"
            stroke={VISIT_COLOR}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="leads"
            name="Leads"
            stroke={LEAD_COLOR}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

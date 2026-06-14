'use client';

import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Users,
  TrendingUp,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Trash2,
} from 'lucide-react';
import { Badge, RowUser, ActionButtons } from '@/features/admin/shared';
import type { DashboardStats, ChartDataPoint, DonutSegment, Lead } from '@/features/admin/types';

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  iconVariant: 'blue' | 'green' | 'yellow' | 'purple';
  value: string | number;
  label: string;
  change: number;
  suffix?: string;
}

function StatCard({ icon, iconVariant, value, label, change, suffix }: StatCardProps) {
  const isUp = change >= 0;
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${iconVariant}`}>
          {icon}
        </div>
        <span
          className={`stat-card__trend ${isUp ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}
        >
          {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="stat-card__value">
        {value}
        {suffix && <span style={{ fontSize: '1rem', fontWeight: 500 }}>{suffix}</span>}
      </div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__sub">So với tháng trước</div>
    </div>
  );
}

// ─── Line Chart (pure SVG) ───────────────────────────────────────────────────

interface LineChartProps {
  data: ChartDataPoint[];
  className?: string;
}

function LineChart({ data, className = '' }: LineChartProps) {
  const width = 560;
  const height = 200;
  const padding = { top: 10, right: 10, bottom: 30, left: 40 };

  if (!data.length) return null;

  const visits = data.map((d) => d.visits);
  const leads = data.map((d) => d.leads);
  const allValues = [...visits, ...leads];
  const maxVal = Math.max(...allValues) * 1.15;
  const minVal = 0;

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (v: number) =>
    padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const visitPoints = visits.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
  const leadPoints = leads.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');

  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className={`admin-card ${className}`} style={{ padding: '20px' }}>
      <div className="admin-card__header">
        <div className="admin-card__title">Lượt truy cập & Leads</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Truy cập</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Leads</span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        aria-label="Biểu đồ lượt truy cập và leads"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = yScale(tick * (maxVal - minVal) + minVal);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#E4E8EF"
                strokeDasharray="4,3"
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#9CA3AF"
              >
                {Math.round(tick * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Visits area fill */}
        <polygon
          points={`${xScale(0)},${yScale(0)} ${visitPoints} ${xScale(data.length - 1)},${yScale(0)}`}
          fill="#2563EB"
          fillOpacity="0.08"
        />

        {/* Visits line */}
        <polyline
          points={visitPoints}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Leads line */}
        <polyline
          points={leadPoints}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {visits.map((v, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(v)}
            r="3"
            fill="#2563EB"
          />
        ))}
        {leads.map((v, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(v)}
            r="3"
            fill="#C9A84C"
          />
        ))}

        {/* X axis labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#9CA3AF"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Donut Chart (pure SVG) ──────────────────────────────────────────────────

interface DonutChartProps {
  segments: DonutSegment[];
  className?: string;
}

function DonutChart({ segments, className = '' }: DonutChartProps) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const innerR = 36;

  let currentAngle = -90;
  const paths = segments.map((seg) => {
    const angle = (seg.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const ix1 = cx + innerR * Math.cos(startRad);
    const iy1 = cy + innerR * Math.sin(startRad);
    const ix2 = cx + innerR * Math.cos(endRad);
    const iy2 = cy + innerR * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { ...seg, d };
  });

  return (
    <div className={`admin-card ${className}`} style={{ padding: '20px' }}>
      <div className="admin-card__header">
        <div className="admin-card__title">Nguồn Leads</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Biểu đồ nguồn leads"
        >
          {paths.map((p) => (
            <path key={p.label} d={p.d} fill={p.color} />
          ))}
        </svg>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.map((seg) => (
            <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: seg.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)', flex: 1 }}>
                {seg.label}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                {seg.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Recent Leads Table ────────────────────────────────────────────────────────

interface RecentLeadsTableProps {
  leads: Lead[];
  className?: string;
}

function RecentLeadsTable({ leads, className = '' }: RecentLeadsTableProps) {
  return (
    <div className={`admin-card table-card ${className}`}>
      <div className="table-header">
        <div className="table-title">
          Leads gần đây <span>({leads.length} mới hôm nay)</span>
        </div>
        <button type="button" className="admin-card__action">
          Xem tất cả →
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Dịch vụ</th>
              <th>Nguồn</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <RowUser
                    initials={lead.name}
                    name={lead.name}
                    sub={lead.phone}
                  />
                </td>
                <td style={{ color: 'var(--gray-600)', fontSize: '0.82rem' }}>
                  {lead.service}
                </td>
                <td>
                  <SourceTag source={lead.source} />
                </td>
                <td>
                  <StatusBadge status={lead.status} />
                </td>
                <td>
                  <ActionButtons
                    onView={() => {}}
                    onEdit={() => {}}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Lead Kanban ─────────────────────────────────────────────────────────────

interface KanbanCard {
  id: string;
  name: string;
  service: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
}

interface LeadKanbanProps {
  className?: string;
}

const KANBAN_COLS = [
  { id: 'new', label: 'Mới', color: '#2563EB' },
  { id: 'contacted', label: 'Đã liên hệ', color: '#D97706' },
  { id: 'progress', label: 'Đang xử lý', color: '#7C3AED' },
  { id: 'done', label: 'Hoàn tất', color: '#059669' },
];

const KANBAN_CARDS: KanbanCard[] = [
  { id: '1', name: 'Nguyễn Văn A', service: 'Thành lập công ty', time: '10 phút trước', priority: 'high' },
  { id: '2', name: 'Trần Thị B', service: 'Hợp đồng thuê', time: '25 phút trước', priority: 'medium' },
  { id: '3', name: 'Lê Minh C', service: 'Tư vấn luật', time: '1 giờ trước', priority: 'low' },
  { id: '4', name: 'Phạm Hoàng D', service: 'Sở hữu trí tuệ', time: '2 giờ trước', priority: 'high' },
  { id: '5', name: 'Hoàng Lan E', service: 'Ly hôn', time: '3 giờ trước', priority: 'medium' },
  { id: '6', name: 'Đặng Quốc F', service: 'Thành lập công ty', time: '5 giờ trước', priority: 'low' },
];

const PRIORITY_COLORS = { low: '#059669', medium: '#D97706', high: '#DC2626' };

function LeadKanban({ className = '' }: LeadKanbanProps) {
  return (
    <div className={`admin-card ${className}`}>
      <div className="admin-card__header">
        <div className="admin-card__title">Pipeline Leads</div>
        <button type="button" className="admin-card__action">
          Xem chi tiết →
        </button>
      </div>

      <div className="kanban">
        {KANBAN_COLS.map((col) => {
          const cards = KANBAN_CARDS.slice(
            col.id === 'new' ? 0 : 2,
            col.id === 'new' ? 2 : 5,
          );
          return (
            <div key={col.id} className={`kanban__col kanban__col--${col.id}`}>
              <div className="kanban__col-header">
                <span className="kanban__col-title">{col.label}</span>
                <span className="kanban__col-count">{cards.length}</span>
              </div>
              {cards.map((card) => (
                <div key={card.id} className="kanban__card">
                  <div className="kanban__card-name">{card.name}</div>
                  <div className="kanban__card-service">{card.service}</div>
                  <div className="kanban__card-meta">
                    <span className="kanban__card-time">{card.time}</span>
                    <span
                      className="kanban__card-dot"
                      style={{ background: PRIORITY_COLORS[card.priority] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    id: '1',
    icon: '📅',
    iconBg: '#EFF6FF',
    text: '<strong>Lê Thị Lan</strong> vừa đặt lịch hẹn <strong>"Tư vấn pháp luật"</strong>',
    time: '5 phút trước',
  },
  {
    id: '2',
    icon: '💬',
    iconBg: '#F5F3FF',
    text: '<strong>Trần Đức Anh</strong> được chuyển từ chatbot sang tư vấn viên',
    time: '12 phút trước',
  },
  {
    id: '3',
    icon: '📝',
    iconBg: '#ECFDF5',
    text: 'Bài viết <strong>"Hướng dẫn thành lập công ty 2025"</strong> được xuất bản',
    time: '1 giờ trước',
  },
  {
    id: '4',
    icon: '⭐',
    iconBg: '#FFFBEB',
    text: '<strong>Nguyễn Thị Mai</strong> gửi đánh giá 5 sao cho dịch vụ tư vấn',
    time: '2 giờ trước',
  },
  {
    id: '5',
    icon: '📧',
    iconBg: '#FEF2F2',
    text: '<strong>Phạm Minh Tuấn</strong> đăng ký nhận bản tin Newsletter',
    time: '3 giờ trước',
  },
];

function RecentActivity({ className = '' }: RecentActivityProps) {
  return (
    <div className={`admin-card ${className}`}>
      <div className="admin-card__header">
        <div className="admin-card__title">Hoạt động gần đây</div>
      </div>
      <div className="activity-list">
        {ACTIVITIES.map((a) => (
          <div key={a.id} className="activity-item">
            <div
              className="activity-item__icon"
              style={{ background: a.iconBg }}
              aria-hidden="true"
            >
              {a.icon}
            </div>
            <div className="activity-item__content">
              <div
                className="activity-item__text"
                dangerouslySetInnerHTML={{ __html: a.text }}
              />
              <div className="activity-item__time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Tạo lịch hẹn', bg: '#EFF6FF', color: '#2563EB' },
  { icon: '👤', label: 'Thêm Lead mới', bg: '#F5F3FF', color: '#7C3AED' },
  { icon: '📝', label: 'Viết bài Blog', bg: '#ECFDF5', color: '#059669' },
  { icon: '📊', label: 'Xuất báo cáo', bg: '#FFFBEB', color: '#D97706' },
];

function QuickActions() {
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div className="admin-card__title">Thao tác nhanh</div>
      </div>
      <div className="quick-actions">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            type="button"
            className="quick-action"
            style={{ textAlign: 'left' }}
          >
            <div
              className="quick-action__icon"
              style={{ background: qa.bg, color: qa.color }}
              aria-hidden="true"
            >
              {qa.icon}
            </div>
            <span className="quick-action__label">{qa.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type RecentActivityProps = { className?: string };

const SOURCE_MAP: Record<string, string> = {
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  organic: 'Tự nhiên',
  chatbot: 'Chatbot',
  referral: 'Giới thiệu',
};

const SOURCE_CLASS: Record<string, string> = {
  facebook: 'facebook',
  google_ads: 'google',
  organic: 'organic',
  chatbot: 'chatbot',
  referral: 'referral',
};

function SourceTag({ source }: { source: string }) {
  const label = SOURCE_MAP[source] ?? source;
  const cls = SOURCE_CLASS[source] ?? '';
  return (
    <span className={`source-tag source-tag--${cls}`}>
      {label}
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; variant: 'green' | 'yellow' | 'red' | 'blue' | 'purple' }> = {
  new: { label: 'Mới', variant: 'blue' },
  contacted: { label: 'Đã liên hệ', variant: 'yellow' },
  progress: { label: 'Đang xử lý', variant: 'purple' },
  converted: { label: 'Đã chuyển đổi', variant: 'green' },
  lost: { label: 'Mất lead', variant: 'red' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, variant: 'blue' as const };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

// Mock data
const MOCK_STATS: DashboardStats = {
  appointments_today: 24,
  appointments_change: 12,
  leads_week: 156,
  leads_change: 8,
  conversion_rate: 32,
  conversion_change: 5,
  chatbot_conversations: 892,
  chatbot_change: -3,
};

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { date: '2025-05-19', visits: 120, leads: 12 },
  { date: '2025-05-20', visits: 185, leads: 22 },
  { date: '2025-05-21', visits: 210, leads: 28 },
  { date: '2025-05-22', visits: 165, leads: 18 },
  { date: '2025-05-23', visits: 280, leads: 35 },
  { date: '2025-05-24', visits: 310, leads: 42 },
  { date: '2025-05-25', visits: 245, leads: 30 },
];

const MOCK_DONUT_DATA: DonutSegment[] = [
  { label: 'Facebook', value: 45, percentage: 38, color: '#2563EB' },
  { label: 'Google Ads', value: 28, percentage: 24, color: '#D97706' },
  { label: 'Chatbot', value: 22, percentage: 19, color: '#7C3AED' },
  { label: 'Tự nhiên', value: 15, percentage: 13, color: '#059669' },
  { label: 'Khác', value: 8, percentage: 6, color: '#9CA3AF' },
];

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901 234 567', email: 'nva@email.com', service: 'Thành lập công ty', source: 'facebook', status: 'new', assignedTo: 'Lan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Trần Thị B', phone: '0902 345 678', email: 'ttb@email.com', service: 'Hợp đồng thuê', source: 'google_ads', status: 'contacted', assignedTo: 'Minh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Lê Minh C', phone: '0903 456 789', email: 'lmc@email.com', service: 'Tư vấn luật', source: 'chatbot', status: 'progress', assignedTo: 'Hùng', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: 'Phạm Hoàng D', phone: '0904 567 890', email: 'phd@email.com', service: 'Sở hữu trí tuệ', source: 'organic', status: 'new', assignedTo: 'Lan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: 'Hoàng Lan E', phone: '0905 678 901', email: 'hle@email.com', service: 'Ly hôn', source: 'facebook', status: 'converted', assignedTo: 'Minh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [chartData] = useState<ChartDataPoint[]>(MOCK_CHART_DATA);
  const [donutData] = useState<DonutSegment[]>(MOCK_DONUT_DATA);
  const [leads] = useState<Lead[]>(MOCK_LEADS);

  return (
    <div className="admin-view">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<CalendarCheck size={20} />}
          iconVariant="blue"
          value={stats.appointments_today}
          label="Lịch hẹn hôm nay"
          change={stats.appointments_change}
        />
        <StatCard
          icon={<Users size={20} />}
          iconVariant="green"
          value={stats.leads_week}
          label="Leads tuần này"
          change={stats.leads_change}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          iconVariant="yellow"
          value={stats.conversion_rate}
          suffix="%"
          label="Tỷ lệ chuyển đổi"
          change={stats.conversion_change}
        />
        <StatCard
          icon={<Bot size={20} />}
          iconVariant="purple"
          value={stats.chatbot_conversations}
          label="Cuộc trò chuyện chatbot"
          change={stats.chatbot_change}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <LineChart data={chartData} />
        <DonutChart segments={donutData} />
      </div>

      {/* Recent Leads + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <RecentLeadsTable leads={leads} />
        <QuickActions />
      </div>

      {/* Kanban + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        <LeadKanban />
        <RecentActivity />
      </div>
    </div>
  );
}

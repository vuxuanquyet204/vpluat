'use client';

import { useMemo } from 'react';
import { Timeline, StatCardGrid, type StatCardItem } from '@/features/admin/components';
import { PhoneCall, Mail, MessageSquare, Edit3, CalendarPlus, UserCog, FileText } from 'lucide-react';
import type { LeadTimelineEntry } from '@/features/admin/types';

const TYPE_META: Record<
  LeadTimelineEntry['type'],
  { icon: React.ReactNode; bg: string; color: string; label: string }
> = {
  note: { icon: <FileText size={12} />, bg: '#FFFBEB', color: '#D97706', label: 'Ghi chú' },
  call: { icon: <PhoneCall size={12} />, bg: '#ECFDF5', color: '#059669', label: 'Cuộc gọi' },
  email: { icon: <Mail size={12} />, bg: '#EFF6FF', color: '#2563EB', label: 'Email' },
  status_change: { icon: <Edit3 size={12} />, bg: '#F5F3FF', color: '#7C3AED', label: 'Đổi trạng thái' },
  booking_created: { icon: <CalendarPlus size={12} />, bg: '#FEF2F2', color: '#DC2626', label: 'Tạo booking' },
  assignment_change: { icon: <UserCog size={12} />, bg: '#F0F9FF', color: '#0284C7', label: 'Phân công' },
};

interface LeadTimelineProps {
  entries: LeadTimelineEntry[];
}

function formatRelative(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function LeadTimeline({ entries }: LeadTimelineProps) {
  const items = useMemo(
    () =>
      [...entries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((e) => {
          const meta = TYPE_META[e.type];
          return {
            id: e.id,
            icon: meta.icon,
            iconBg: meta.bg,
            iconColor: meta.color,
            title: e.content,
            description: `${meta.label} · bởi ${e.authorName}`,
            time: formatRelative(e.createdAt),
          };
        }),
    [entries],
  );
  return <Timeline items={items} emptyMessage="Chưa có hoạt động nào" />;
}

interface LeadStatsProps {
  total: number;
  newCount: number;
  contactedCount: number;
  convertedCount: number;
  lostCount: number;
}

export function LeadStats({ total, newCount, contactedCount, convertedCount, lostCount }: LeadStatsProps) {
  const items: StatCardItem[] = [
    { label: 'Tổng lead', value: total, iconVariant: 'blue', icon: <MessageSquare size={18} /> },
    { label: 'Mới', value: newCount, iconVariant: 'blue', icon: <Edit3 size={18} /> },
    { label: 'Đang xử lý', value: contactedCount, iconVariant: 'yellow', icon: <PhoneCall size={18} /> },
    { label: 'Đã chuyển đổi', value: convertedCount, change: 15, iconVariant: 'green', icon: <FileText size={18} /> },
    { label: 'Mất lead', value: lostCount, iconVariant: 'red', icon: <FileText size={18} /> },
  ];
  return <StatCardGrid items={items} />;
}

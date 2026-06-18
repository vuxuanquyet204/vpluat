'use client';

import { useMemo } from 'react';
import {
  MessageSquare,
  Phone,
  User,
  Mail,
  Calendar,
  Hand,
  Eye,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { ChatbotSession, ChatbotSessionStatus } from '@/features/admin/types';
import { SESSION_STATUS_LABELS } from '../hooks/use-chatbot';

interface ChatbotSessionsTableProps {
  data: ChatbotSession[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onView: (s: ChatbotSession) => void;
  onDelete: (s: ChatbotSession) => void;
  canDelete: boolean;
}

const STATUS_VARIANT: Record<ChatbotSessionStatus, StatusVariant> = {
  active: 'green',
  ended: 'gray',
  abandoned: 'red',
  handoff: 'blue',
};

const SOURCE_LABELS: Record<NonNullable<ChatbotSession['source']>, string> = {
  web: 'Web',
  facebook: 'Facebook',
  zalo: 'Zalo',
  other: 'Khác',
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatDuration(s: ChatbotSession) {
  if (s.status === 'active') return 'Đang chat';
  if (!s.endedAt) return '—';
  const ms = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime();
  const mins = Math.max(1, Math.round(ms / 60000));
  return `${mins} phút`;
}

export function ChatbotSessionsTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onView,
  onDelete,
  canDelete,
}: ChatbotSessionsTableProps) {
  const allSelected = data.length > 0 && data.every((s) => selectedIds.includes(s.id));
  const someSelected = data.some((s) => selectedIds.includes(s.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((s) => s.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const counts = useMemo(() => {
    let active = 0;
    let handoffs = 0;
    for (const s of data) {
      if (s.status === 'active') active += 1;
      if (s.handoff) handoffs += 1;
    }
    return { active, handoffs };
  }, [data]);

  const columns: DataTableColumn<ChatbotSession>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (s) => (
        <button
          type="button"
          onClick={() => toggleOne(s.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={selectedIds.includes(s.id) ? 'Bỏ chọn' : 'Chọn'}
        >
          {selectedIds.includes(s.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'user',
      header: 'Khách hàng',
      sortable: true,
      cell: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--primary-faint, #EFF3F8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0,
            }}
          >
            <User size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.85rem' }}>
              {s.userName ?? 'Khách vãng lai'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--gray-500)',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {s.userPhone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone size={9} /> {s.userPhone}
                </span>
              )}
              {s.userEmail && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Mail size={9} /> {s.userEmail}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'intent',
      header: 'Intent',
      cell: (s) =>
        s.intent ? (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--primary-faint, #EFF3F8)',
              color: 'var(--primary)',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            {s.intent}
          </span>
        ) : (
          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>—</span>
        ),
    },
    {
      key: 'source',
      header: 'Nguồn',
      width: 90,
      cell: (s) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>
          {s.source ? SOURCE_LABELS[s.source] : 'Web'}
        </span>
      ),
    },
    {
      key: 'messages',
      header: 'Tin nhắn',
      width: 90,
      cell: (s) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.78rem',
            color: 'var(--gray-700)',
          }}
        >
          <MessageSquare size={11} color="var(--gray-400)" />
          {s.messageCount}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Thời lượng',
      width: 110,
      cell: (s) => (
        <span
          style={{
            fontSize: '0.72rem',
            color: s.status === 'active' ? 'var(--success, #10B981)' : 'var(--gray-500)',
            fontWeight: s.status === 'active' ? 600 : 400,
          }}
        >
          {formatDuration(s)}
        </span>
      ),
    },
    {
      key: 'startedAt',
      header: 'Bắt đầu',
      width: 130,
      cell: (s) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={10} />
          {formatDateTime(s.startedAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 120,
      cell: (s) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <StatusBadge variant={STATUS_VARIANT[s.status]} label={SESSION_STATUS_LABELS[s.status]} />
          {s.handoff && (
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--blue, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Hand size={9} /> {s.handoff.to}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      cell: (s) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 6px' }}
            title="Xem chi tiết"
            onClick={() => onView(s)}
          >
            <Eye size={11} />
          </button>
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(s)}
            >
              <Trash2 size={11} color="var(--danger, #DC2626)" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {data.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '6px 10px',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius-md, 6px)',
            fontSize: '0.78rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={toggleAll}
            className="action-btn"
            style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          >
            {allSelected ? (
              <CheckSquare size={14} color="var(--primary)" />
            ) : someSelected ? (
              <CheckSquare size={14} color="var(--primary)" style={{ opacity: 0.5 }} />
            ) : (
              <Square size={14} color="var(--gray-400)" />
            )}
          </button>
          <span style={{ color: 'var(--gray-600)' }}>
            {selectedIds.length > 0
              ? `Đã chọn ${selectedIds.length} / ${data.length}`
              : `${data.length} sessions`}
          </span>
          <span style={{ color: 'var(--gray-500)' }}>
            · {counts.active} đang chat · {counts.handoffs} handoff
          </span>
        </div>
      )}
      <DataTableV2<ChatbotSession>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        emptyTitle="Chưa có session nào"
        emptyDescription="Các cuộc trò chuyện chatbot sẽ xuất hiện ở đây."
      />
    </div>
  );
}
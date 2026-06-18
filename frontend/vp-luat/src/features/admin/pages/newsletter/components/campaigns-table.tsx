'use client';

import { useMemo } from 'react';
import { Send, FileEdit, Trash2, Calendar, BarChart3, Eye, CheckSquare, Square, Mail, Clock, AlertCircle } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Campaign, CampaignStatus } from '@/features/admin/types';
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_SEGMENT_LABELS } from '../hooks/use-newsletter';

interface CampaignsTableProps {
  data: Campaign[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (c: Campaign) => void;
  onDelete: (c: Campaign) => void;
  onSend: (c: Campaign) => void;
  onViewStats: (c: Campaign) => void;
  canWrite: boolean;
  canSend: boolean;
  canDelete: boolean;
}

const STATUS_VARIANT: Record<CampaignStatus, StatusVariant> = {
  draft: 'gray',
  scheduled: 'yellow',
  sending: 'blue',
  sent: 'green',
  failed: 'red',
};

const STATUS_ICON: Record<CampaignStatus, React.ReactNode> = {
  draft: <FileEdit size={10} />,
  scheduled: <Clock size={10} />,
  sending: <Send size={10} />,
  sent: <CheckSquare size={10} />,
  failed: <AlertCircle size={10} />,
};

void STATUS_ICON;

export function CampaignsTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onSend,
  onViewStats,
  canWrite,
  canSend,
  canDelete,
}: CampaignsTableProps) {
  const allSelected = data.length > 0 && data.every((c) => selectedIds.includes(c.id));
  const someSelected = data.some((c) => selectedIds.includes(c.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((c) => c.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const counts = useMemo(() => {
    const c = { draft: 0, scheduled: 0, sent: 0 };
    for (const x of data) {
      if (x.status in c) (c as Record<string, number>)[x.status] += 1;
    }
    return c;
  }, [data]);

  const columns: DataTableColumn<Campaign>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (c) => (
        <button
          type="button"
          onClick={() => toggleOne(c.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={selectedIds.includes(c.id) ? 'Bỏ chọn' : 'Chọn'}
        >
          {selectedIds.includes(c.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Tên / Subject',
      sortable: true,
      cell: (c) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.85rem' }}>
            {c.name}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--gray-500)',
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={c.subject}
          >
            <Mail size={10} style={{ display: 'inline-block', marginRight: 4 }} />
            {c.subject}
          </div>
        </div>
      ),
    },
    {
      key: 'segment',
      header: 'Phân khúc',
      cell: (c) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          {CAMPAIGN_SEGMENT_LABELS[c.segment]}
        </span>
      ),
    },
    {
      key: 'recipientCount',
      header: 'Nhận',
      width: 80,
      cell: (c) => (
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
          {c.recipientCount.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'schedule',
      header: 'Thời gian',
      width: 140,
      cell: (c) => {
        if (c.status === 'sent' && c.sentAt) {
          return (
            <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)' }}>
              <Calendar size={10} style={{ marginRight: 4 }} />
              {new Date(c.sentAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          );
        }
        if (c.status === 'scheduled' && c.scheduledAt) {
          return (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--warning, #D97706)',
                fontWeight: 600,
              }}
            >
              <Clock size={10} style={{ marginRight: 4 }} />
              {new Date(c.scheduledAt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          );
        }
        return <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>—</span>;
      },
    },
    {
      key: 'openRate',
      header: 'Open',
      width: 80,
      cell: (c) => (
        <span
          style={{
            fontSize: '0.78rem',
            color: c.status === 'sent' ? 'var(--gray-700)' : 'var(--gray-400)',
          }}
        >
          {c.status === 'sent' ? `${(c.openRate * 100).toFixed(0)}%` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'TT',
      width: 120,
      cell: (c) => (
        <StatusBadge
          variant={STATUS_VARIANT[c.status]}
          label={CAMPAIGN_STATUS_LABELS[c.status]}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 100,
      cell: (c) => (
        <div style={{ display: 'flex', gap: 2 }}>
          {c.status === 'sent' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xem analytics"
              onClick={() => onViewStats(c)}
            >
              <BarChart3 size={11} />
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Sửa"
              onClick={() => onEdit(c)}
            >
              <FileEdit size={11} />
            </button>
          )}
          {canSend && (c.status === 'draft' || c.status === 'scheduled') && (
            <button
              type="button"
              className="action-btn action-btn--primary"
              style={{ padding: '4px 6px' }}
              title="Gửi ngay"
              onClick={() => onSend(c)}
            >
              <Send size={11} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(c)}
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
            gap: 12,
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
              : `${data.length} campaigns`}
          </span>
          <span style={{ color: 'var(--gray-500)' }}>
            · {counts.draft} nháp · {counts.scheduled} lên lịch · {counts.sent} đã gửi
          </span>
        </div>
      )}
      <DataTableV2<Campaign>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(c) => c.id}
        emptyTitle="Chưa có campaign nào"
        emptyDescription="Tạo campaign đầu tiên để gửi newsletter."
      />
    </div>
  );
}
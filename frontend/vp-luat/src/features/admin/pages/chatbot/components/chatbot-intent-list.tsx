'use client';

import { useMemo } from 'react';
import { Tag, Edit3, Trash2, Hand, MessageCircle, Eye, EyeOff, Copy } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { ChatbotIntent } from '@/features/admin/types';

interface ChatbotIntentListProps {
  data: ChatbotIntent[];
  isLoading?: boolean;
  onEdit: (i: ChatbotIntent) => void;
  onDelete: (i: ChatbotIntent) => void;
  onToggle: (i: ChatbotIntent) => void;
  onDuplicate: (i: ChatbotIntent) => void;
  canWrite: boolean;
  canDelete: boolean;
}

const ACTIVE_VARIANT: StatusVariant = 'green';

export function ChatbotIntentList({
  data,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
  canWrite,
  canDelete,
}: ChatbotIntentListProps) {
  const counts = useMemo(() => {
    const c = { active: 0, handoff: 0, total: data.length };
    for (const i of data) {
      if (i.isActive) c.active += 1;
      if (i.handoffEnabled) c.handoff += 1;
    }
    return c;
  }, [data]);

  const columns: DataTableColumn<ChatbotIntent>[] = [
    {
      key: 'name',
      header: 'Intent',
      sortable: true,
      cell: (i) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: i.isActive ? 'var(--primary-faint, #EFF3F8)' : 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: i.isActive ? 'var(--primary)' : 'var(--gray-400)',
            }}
          >
            <Tag size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--gray-800)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {i.name}
              {i.handoffEnabled && (
                <span
                  title="Có handoff rule"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    padding: '1px 6px',
                    background: 'var(--blue-faint, #DBEAFE)',
                    color: 'var(--blue, #2563EB)',
                    borderRadius: 999,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                >
                  <Hand size={9} /> handoff
                </span>
              )}
            </div>
            {i.description && (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--gray-500)',
                  maxWidth: 280,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={i.description}
              >
                {i.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'utterances',
      header: 'Utterances',
      width: 110,
      cell: (i) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.78rem',
            color: 'var(--gray-700)',
            fontWeight: 600,
          }}
        >
          <MessageCircle size={11} color="var(--gray-400)" />
          {i.sampleUtterances.length}
        </span>
      ),
    },
    {
      key: 'matchCount',
      header: 'Lượt match',
      width: 110,
      cell: (i) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: 'var(--primary-faint, #EFF3F8)',
            color: 'var(--primary)',
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: 700,
          }}
        >
          {i.matchCount.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'handoffTo',
      header: 'Handoff →',
      cell: (i) =>
        i.handoffEnabled && i.handoffTo ? (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--blue, #2563EB)',
              fontWeight: 600,
            }}
          >
            {i.handoffTo}
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>—</span>
        ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: 130,
      cell: (i) => (
        <button
          type="button"
          onClick={() => canWrite && onToggle(i)}
          disabled={!canWrite}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: canWrite ? 'pointer' : 'default',
          }}
          title={canWrite ? 'Bật/tắt intent' : ''}
        >
          <StatusBadge
            variant={i.isActive ? ACTIVE_VARIANT : 'gray'}
            label={i.isActive ? 'Hoạt động' : 'Tạm tắt'}
            icon={i.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 110,
      cell: (i) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 6px' }}
            title="Nhân bản"
            onClick={() => onDuplicate(i)}
          >
            <Copy size={11} />
          </button>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Sửa"
              onClick={() => onEdit(i)}
            >
              <Edit3 size={11} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(i)}
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
          <span style={{ color: 'var(--gray-600)' }}>{data.length} intents</span>
          <span style={{ color: 'var(--gray-500)' }}>
            · {counts.active} active · {counts.handoff} có handoff
          </span>
        </div>
      )}
      <DataTableV2<ChatbotIntent>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(i) => i.id}
        emptyTitle="Chưa có intent nào"
        emptyDescription="Tạo intent để chatbot nhận diện câu hỏi của khách."
      />
    </div>
  );
}
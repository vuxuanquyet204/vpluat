'use client';

import { useMemo } from 'react';
import { Mail, Calendar, Tag, CheckSquare, Square, UserMinus, UserCheck, Trash2 } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Subscriber, SubscriberStatus } from '@/features/admin/types';

interface SubscribersTableProps {
  data: Subscriber[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onDelete: (s: Subscriber) => void;
  onToggle: (s: Subscriber) => void;
  canWrite: boolean;
  canDelete: boolean;
}

const STATUS_VARIANT: Record<SubscriberStatus, StatusVariant> = {
  active: 'green',
  unsubscribed: 'red',
};

export function SubscribersTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onDelete,
  onToggle,
  canWrite,
  canDelete,
}: SubscribersTableProps) {
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

  const totalActive = useMemo(() => data.filter((s) => s.status === 'active').length, [data]);

  const columns: DataTableColumn<Subscriber>[] = [
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
      key: 'email',
      header: 'Email',
      sortable: true,
      cell: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={12} color="var(--gray-400)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.85rem' }}>
              {s.email}
            </div>
            {s.name && (
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{s.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'tags',
      header: 'Tags',
      cell: (s) =>
        s.tags && s.tags.length > 0 ? (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {s.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: 'var(--primary-faint, #EFF3F8)',
                  color: 'var(--primary)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Tag size={8} /> {t}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>—</span>
        ),
    },
    {
      key: 'source',
      header: 'Nguồn',
      cell: (s) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
          {s.source ?? '—'}
        </span>
      ),
    },
    {
      key: 'subscribedAt',
      header: 'Đăng ký',
      width: 110,
      cell: (s) => (
        <span
          style={{ fontSize: '0.72rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Calendar size={10} />{' '}
          {new Date(s.subscribedAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 130,
      cell: (s) => (
        <button
          type="button"
          onClick={() => canWrite && onToggle(s)}
          disabled={!canWrite}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: canWrite ? 'pointer' : 'default',
          }}
          title={canWrite ? 'Bật/tắt' : ''}
        >
          <StatusBadge
            variant={STATUS_VARIANT[s.status]}
            label={s.status === 'active' ? 'Đang hoạt động' : 'Đã hủy'}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 90,
      cell: (s) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title={s.status === 'active' ? 'Hủy đăng ký' : 'Kích hoạt lại'}
              onClick={() => onToggle(s)}
            >
              {s.status === 'active' ? (
                <UserMinus size={11} color="var(--danger, #DC2626)" />
              ) : (
                <UserCheck size={11} color="var(--success, #10B981)" />
              )}
            </button>
          )}
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
              : `Chọn tất cả (${data.length})`}
          </span>
          <span style={{ marginLeft: 8, color: 'var(--gray-500)' }}>
            {totalActive} active
          </span>
        </div>
      )}
      <DataTableV2<Subscriber>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        emptyTitle="Chưa có subscribers"
        emptyDescription="Import CSV hoặc tạo subscriber đầu tiên."
      />
    </div>
  );
}
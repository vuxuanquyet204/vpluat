'use client';

import { useMemo } from 'react';
import { Pencil, Trash2, Eye, Briefcase, CheckSquare, Square } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Service, Lawyer } from '@/features/admin/types';

const ACTIVE_VARIANT: StatusVariant = 'green';

interface ServicesTableProps {
  data: Service[];
  lawyers: Lawyer[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  canWrite: boolean;
  canDelete: boolean;
}

function formatPrice(v?: number): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(v);
}

export function ServicesTable({
  data,
  lawyers,
  isLoading,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onToggleActive,
  canWrite,
  canDelete,
}: ServicesTableProps) {
  const lawyerMap = useMemo(() => {
    const m = new Map<string, Lawyer>();
    lawyers.forEach((l) => m.set(l.id, l));
    return m;
  }, [lawyers]);

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

  const columns: DataTableColumn<Service>[] = [
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
      key: 'name',
      header: 'Dịch vụ',
      sortable: true,
      cell: (s) => (
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              color: 'var(--primary)',
              fontSize: '0.85rem',
            }}
            title={s.name}
          >
            {s.name}
          </div>
          {s.description && (
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--gray-500)',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320,
              }}
              title={s.description}
            >
              {s.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Danh mục',
      cell: (s) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-700)' }}>{s.category}</span>
      ),
    },
    {
      key: 'price',
      header: 'Giá',
      sortable: true,
      cell: (s) => (
        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
          {formatPrice(s.price)}
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'Thời gian',
      cell: (s) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>
          {s.duration != null ? `${s.duration} ngày` : '—'}
        </span>
      ),
    },
    {
      key: 'lawyerIds',
      header: 'Luật sư',
      cell: (s) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Briefcase size={12} color="var(--gray-500)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
            {s.lawyerIds.length === 0
              ? '—'
              : s.lawyerIds
                  .map((id) => lawyerMap.get(id)?.name ?? id)
                  .slice(0, 2)
                  .join(', ') + (s.lawyerIds.length > 2 ? ` +${s.lawyerIds.length - 2}` : '')}
          </span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: 110,
      cell: (s) => (
        <button
          type="button"
          onClick={() => canWrite && onToggleActive(s)}
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
            variant={s.isActive ? ACTIVE_VARIANT : 'red'}
            label={s.isActive ? 'Hoạt động' : 'Tạm dừng'}
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
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Sửa"
            onClick={() => onEdit(s)}
          >
            <Pencil size={12} />
          </button>
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Xóa"
              onClick={() => onDelete(s)}
            >
              <Trash2 size={12} color="var(--danger, #DC2626)" />
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
        </div>
      )}
      <DataTableV2<Service>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(s) => s.id}
        emptyTitle="Chưa có dịch vụ nào"
        emptyDescription="Tạo dịch vụ đầu tiên để bắt đầu."
      />
    </div>
  );
}
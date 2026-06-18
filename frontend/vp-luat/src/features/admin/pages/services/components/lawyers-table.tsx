'use client';

import { useMemo } from 'react';
import { Pencil, Trash2, Briefcase, Mail, Phone, CheckSquare, Square } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Lawyer, Service } from '@/features/admin/types';

interface LawyersTableProps {
  data: Lawyer[];
  services: Service[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (lawyer: Lawyer) => void;
  onDelete: (lawyer: Lawyer) => void;
  onToggleActive: (lawyer: Lawyer) => void;
  canWrite: boolean;
  canDelete: boolean;
}

export function LawyersTable({
  data,
  services,
  isLoading,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onToggleActive,
  canWrite,
  canDelete,
}: LawyersTableProps) {
  const serviceMap = useMemo(() => {
    const m = new Map<string, Service>();
    services.forEach((s) => m.set(s.id, s));
    return m;
  }, [services]);

  const allSelected = data.length > 0 && data.every((l) => selectedIds.includes(l.id));
  const someSelected = data.some((l) => selectedIds.includes(l.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((l) => l.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const columns: DataTableColumn<Lawyer>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (l) => (
        <button
          type="button"
          onClick={() => toggleOne(l.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={selectedIds.includes(l.id) ? 'Bỏ chọn' : 'Chọn'}
        >
          {selectedIds.includes(l.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Luật sư',
      sortable: true,
      cell: (l) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {l.avatar ? (
            <img
              src={l.avatar}
              alt={l.name}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--primary-faint, #EFF3F8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: 'var(--primary)',
                flexShrink: 0,
              }}
            >
              {l.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>
              {l.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{l.title}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'specialties',
      header: 'Chuyên môn',
      cell: (l) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
          {l.specialties.slice(0, 3).map((sp) => (
            <span
              key={sp}
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--primary-faint, #EFF3F8)',
                color: 'var(--primary)',
                fontSize: '0.68rem',
                fontWeight: 600,
              }}
            >
              {sp}
            </span>
          ))}
          {l.specialties.length > 3 && (
            <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
              +{l.specialties.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'experience',
      header: 'Kinh nghiệm',
      width: 110,
      cell: (l) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--gray-700)', fontWeight: 600 }}>
          {l.experience} năm
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Liên hệ',
      cell: (l) => (
        <div style={{ fontSize: '0.78rem' }}>
          <div style={{ color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Mail size={11} /> {l.email}
          </div>
          <div style={{ color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Phone size={11} /> {l.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'serviceIds',
      header: 'Dịch vụ',
      cell: (l) => (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Briefcase size={12} color="var(--gray-500)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>
            {l.serviceIds.length === 0
              ? '—'
              : l.serviceIds
                  .map((id) => serviceMap.get(id)?.name ?? id)
                  .slice(0, 2)
                  .join(', ') + (l.serviceIds.length > 2 ? ` +${l.serviceIds.length - 2}` : '')}
          </span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      width: 110,
      cell: (l) => (
        <button
          type="button"
          onClick={() => canWrite && onToggleActive(l)}
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
            variant={(l.isActive ? 'green' : 'red') as StatusVariant}
            label={l.isActive ? 'Hoạt động' : 'Tạm dừng'}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 90,
      cell: (l) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Sửa"
            onClick={() => onEdit(l)}
          >
            <Pencil size={12} />
          </button>
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 8px' }}
              title="Xóa"
              onClick={() => onDelete(l)}
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
      <DataTableV2<Lawyer>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(l) => l.id}
        emptyTitle="Chưa có luật sư nào"
        emptyDescription="Tạo luật sư đầu tiên để bắt đầu."
      />
    </div>
  );
}
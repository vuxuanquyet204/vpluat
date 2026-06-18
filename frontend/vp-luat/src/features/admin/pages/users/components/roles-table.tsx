'use client';

import { Edit3, Trash2, Users as UsersIcon, CheckSquare, Square } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge } from '@/features/admin/shared';
import type { Role } from '@/features/admin/types';

interface RolesTableProps {
  data: Role[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (r: Role) => void;
  onDelete: (r: Role) => void;
  canWrite: boolean;
  canDelete: boolean;
}

export function RolesTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  canWrite,
  canDelete,
}: RolesTableProps) {
  const allSelected = data.length > 0 && data.every((r) => selectedIds.includes(r.id));
  const someSelected = data.some((r) => selectedIds.includes(r.id)) && !allSelected;
  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((r) => r.id));
  };
  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (r) => (
        <button
          type="button"
          onClick={() => toggleOne(r.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Chọn"
        >
          {selectedIds.includes(r.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Tên role',
      sortable: true,
      cell: (r) => (
        <div>
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
            {r.name}
            {r.isSystem && (
              <span
                style={{
                  padding: '1px 6px',
                  background: 'var(--primary-faint, #EFF3F8)',
                  color: 'var(--primary)',
                  borderRadius: 999,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                System
              </span>
            )}
          </div>
          {r.description && (
            <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{r.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      width: 110,
      cell: (r) => (
        <StatusBadge
          variant={r.permissions.length >= 28 ? 'red' : r.permissions.length > 10 ? 'blue' : 'green'}
          label={`${r.permissions.length} quyền`}
        />
      ),
    },
    {
      key: 'memberCount',
      header: 'Members',
      width: 110,
      cell: (r) => (
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
          <UsersIcon size={12} /> {r.memberCount}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 120,
      cell: (r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title={r.isSystem ? 'Sửa permissions trong Permission Matrix' : 'Sửa'}
              disabled={r.isSystem}
              onClick={() => onEdit(r)}
            >
              <Edit3 size={11} color={r.isSystem ? 'var(--gray-400)' : 'currentColor'} />
            </button>
          )}
          {canDelete && !r.isSystem && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(r)}
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
              : `${data.length} roles`}
          </span>
        </div>
      )}
      <DataTableV2<Role>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle="Chưa có role nào"
        emptyDescription="Tạo role đầu tiên để gán quyền cho user."
      />
    </div>
  );
}
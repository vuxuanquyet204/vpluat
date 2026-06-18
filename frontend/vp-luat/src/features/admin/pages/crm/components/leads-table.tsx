'use client';

import { Phone, Mail, MessageSquare, MoreHorizontal, Eye } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { RowUser, StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Lead, LeadStatus } from '@/features/admin/types';

const STATUS_MAP: Record<LeadStatus, { label: string; variant: StatusVariant }> = {
  new: { label: 'Mới', variant: 'blue' },
  contacted: { label: 'Đã liên hệ', variant: 'yellow' },
  progress: { label: 'Đang xử lý', variant: 'purple' },
  converted: { label: 'Đã chuyển đổi', variant: 'green' },
  lost: { label: 'Mất lead', variant: 'red' },
};

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  google_ads: 'Google Ads',
  organic: 'Tự nhiên',
  chatbot: 'Chatbot',
  referral: 'Giới thiệu',
  other: 'Khác',
};

interface LeadsTableProps {
  data: Lead[] | undefined;
  isLoading?: boolean;
  onRowClick: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onBulkStatusChange: (leads: Lead[], status: LeadStatus) => void;
  onBulkAssign: (leads: Lead[], assignee: string) => void;
  onBulkDelete: (leads: Lead[]) => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function LeadsTable({
  data,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
  onBulkStatusChange,
  onBulkAssign,
  onBulkDelete,
}: LeadsTableProps) {
  const columns: DataTableColumn<Lead>[] = [
    {
      key: 'name',
      header: 'Khách hàng',
      sortable: true,
      cell: (l) => (
        <RowUser
          initials={l.name}
          name={l.name}
          sub={`${l.phone} · ${l.email}`}
        />
      ),
    },
    {
      key: 'service',
      header: 'Dịch vụ',
      cell: (l) => <span style={{ color: 'var(--gray-600)' }}>{l.service}</span>,
    },
    {
      key: 'source',
      header: 'Nguồn',
      cell: (l) => (
        <span className={`source-tag source-tag--${l.source === 'google_ads' ? 'google' : l.source}`}>
          {SOURCE_LABELS[l.source] ?? l.source}
        </span>
      ),
    },
    {
      key: 'assignedTo',
      header: 'CSKH',
      cell: (l) => <span style={{ color: 'var(--gray-600)' }}>{l.assignedTo}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      cell: (l) => {
        const s = STATUS_MAP[l.status];
        return <StatusBadge label={s.label} variant={s.variant} />;
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      cell: (l) => (
        <span style={{ color: 'var(--gray-400)', fontSize: '0.78rem' }}>{formatDate(l.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      cell: (l) => (
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Xem"
            aria-label="Xem chi tiết"
            onClick={() => onRowClick(l)}
          >
            <Eye size={12} />
          </button>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Gọi"
            aria-label="Gọi điện"
            onClick={() => window.open(`tel:${l.phone}`)}
          >
            <Phone size={12} />
          </button>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="Email"
            aria-label="Gửi email"
            onClick={() => window.open(`mailto:${l.email}`)}
          >
            <Mail size={12} />
          </button>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 8px' }}
            title="SMS"
            aria-label="Nhắn tin"
          >
            <MessageSquare size={12} />
          </button>
          <RowActionMenu lead={l} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ),
    },
  ];

  return (
    <DataTableV2<Lead>
      data={data}
      columns={columns}
      isLoading={isLoading}
      selectable
      onRowClick={onRowClick}
      defaultSort={{ by: 'createdAt', dir: 'desc' }}
      emptyTitle="Chưa có lead nào"
      emptyDescription="Lead mới sẽ tự động xuất hiện khi có người đăng ký từ landing page hoặc chatbot."
      bulkActions={[
        {
          label: 'Đổi trạng thái',
          onClick: (selected) => {
            const status = window.prompt(
              `Đổi trạng thái ${selected.length} lead sang:\n(new / contacted / progress / converted / lost)`,
              'contacted',
            );
            if (status && ['new', 'contacted', 'progress', 'converted', 'lost'].includes(status)) {
              onBulkStatusChange(selected, status as LeadStatus);
            }
          },
        },
        {
          label: 'Gán CSKH',
          onClick: (selected) => {
            const assignee = window.prompt('Gán cho CSKH (tên):', 'Lan');
            if (assignee) onBulkAssign(selected, assignee);
          },
        },
        {
          label: 'Xóa',
          icon: <TrashIcon />,
          variant: 'danger',
          onClick: (selected) => onBulkDelete(selected),
        },
      ]}
    />
  );
}

function RowActionMenu({
  lead,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onEdit: (l: Lead) => void;
  onDelete: (l: Lead) => void;
}) {
  return (
    <details style={{ position: 'relative' }}>
      <summary
        className="action-btn"
        style={{ padding: '4px 8px', listStyle: 'none', cursor: 'pointer' }}
        aria-label="Thêm hành động"
      >
        <MoreHorizontal size={12} />
      </summary>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: 4,
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-md, 8px)',
          boxShadow: '0 4px 12px rgb(15 23 42 / 0.08)',
          padding: 4,
          minWidth: 140,
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => onEdit(lead)}
          style={menuItemStyle}
        >
          Sửa
        </button>
        <button
          type="button"
          onClick={() => onDelete(lead)}
          style={{ ...menuItemStyle, color: '#DC2626' }}
        >
          Xóa
        </button>
      </div>
    </details>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 10px',
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
  fontSize: '0.82rem',
  color: 'var(--gray-700)',
  borderRadius: 4,
  cursor: 'pointer',
};

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

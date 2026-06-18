'use client';

import { useMemo } from 'react';
import {
  Edit3,
  Trash2,
  Eye,
  Copy,
  Layers,
  BarChart3,
  Rocket,
  CheckSquare,
  Square,
} from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { LandingPage, LandingPageStatus } from '@/features/admin/types';
import { STATUS_LABELS, AUDIENCE_LABELS } from '../hooks/use-landing-pages';

interface LandingPagesTableProps {
  data: LandingPage[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (p: LandingPage) => void;
  onDelete: (p: LandingPage) => void;
  onPreview: (p: LandingPage) => void;
  onDuplicate: (p: LandingPage) => void;
  onAnalytics: (p: LandingPage) => void;
  onPublish: (p: LandingPage) => void;
  onUnpublish: (p: LandingPage) => void;
  onVariants: (p: LandingPage) => void;
  canWrite: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

const STATUS_VARIANT: Record<LandingPageStatus, StatusVariant> = {
  draft: 'yellow',
  published: 'green',
  archived: 'gray',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export function LandingPagesTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onAnalytics,
  onPublish,
  onUnpublish,
  onVariants,
  canWrite,
  canDelete,
  canPublish,
}: LandingPagesTableProps) {
  const allSelected = data.length > 0 && data.every((p) => selectedIds.includes(p.id));
  const someSelected = data.some((p) => selectedIds.includes(p.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) onSelectChange([]);
    else onSelectChange(data.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) onSelectChange(selectedIds.filter((x) => x !== id));
    else onSelectChange([...selectedIds, id]);
  };

  const totalViews = useMemo(
    () => data.reduce((sum, p) => sum + (p.analytics?.views ?? 0), 0),
    [data],
  );
  const totalConv = useMemo(
    () => data.reduce((sum, p) => sum + (p.analytics?.conversions ?? 0), 0),
    [data],
  );

  const columns: DataTableColumn<LandingPage>[] = [
    {
      key: 'select',
      header: '',
      width: 40,
      cell: (p) => (
        <button
          type="button"
          onClick={() => toggleOne(p.id)}
          className="action-btn"
          style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label={selectedIds.includes(p.id) ? 'Bỏ chọn' : 'Chọn'}
        >
          {selectedIds.includes(p.id) ? (
            <CheckSquare size={14} color="var(--primary)" />
          ) : (
            <Square size={14} color="var(--gray-400)" />
          )}
        </button>
      ),
    },
    {
      key: 'title',
      header: 'Tiêu đề',
      sortable: true,
      cell: (p) => (
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
            {p.title}
            {p.isVariant && (
              <span
                style={{
                  padding: '1px 6px',
                  background: 'var(--blue-faint, #DBEAFE)',
                  color: 'var(--blue, #2563EB)',
                  borderRadius: 999,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                Variant {p.variantLabel}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>
            /{p.slug} · {p.blocks.length} blocks
          </div>
        </div>
      ),
    },
    {
      key: 'audience',
      header: 'Đối tượng',
      width: 140,
      cell: (p) => (
        <span
          style={{
            padding: '2px 8px',
            background: 'var(--primary-faint, #EFF3F8)',
            color: 'var(--primary)',
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 600,
          }}
        >
          {AUDIENCE_LABELS[p.targetAudience]}
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      width: 90,
      cell: (p) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--gray-700)', fontWeight: 600 }}>
          {(p.analytics?.views ?? 0).toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'conv',
      header: 'Conversions',
      width: 110,
      cell: (p) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--success, #10B981)', fontWeight: 600 }}>
          {(p.analytics?.conversions ?? 0).toLocaleString('vi-VN')}
          <span style={{ color: 'var(--gray-400)', fontWeight: 400, marginLeft: 4 }}>
            ({(p.analytics?.ctr ?? 0).toFixed(1)}%)
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 120,
      cell: (p) => (
        <StatusBadge variant={STATUS_VARIANT[p.status]} label={STATUS_LABELS[p.status]} />
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      width: 110,
      cell: (p) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
          {formatDate(p.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 200,
      cell: (p) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {p.status === 'published' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xem trước"
              onClick={() => onPreview(p)}
            >
              <Eye size={11} />
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Sửa"
              onClick={() => onEdit(p)}
            >
              <Edit3 size={11} />
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Nhân bản"
              onClick={() => onDuplicate(p)}
            >
              <Copy size={11} />
            </button>
          )}
          {canWrite && !p.isVariant && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="A/B Variants"
              onClick={() => onVariants(p)}
            >
              <Layers size={11} />
            </button>
          )}
          {canWrite && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Analytics"
              onClick={() => onAnalytics(p)}
            >
              <BarChart3 size={11} />
            </button>
          )}
          {canPublish && p.status === 'draft' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px', color: 'var(--success, #10B981)' }}
              title="Publish"
              onClick={() => onPublish(p)}
            >
              <Rocket size={11} />
            </button>
          )}
          {canPublish && p.status === 'published' && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Unpublish"
              onClick={() => onUnpublish(p)}
            >
              <Rocket size={11} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(p)}
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
              : `${data.length} pages`}
          </span>
          <span style={{ color: 'var(--gray-500)' }}>
            · {totalViews.toLocaleString('vi-VN')} views · {totalConv.toLocaleString('vi-VN')} conversions
          </span>
        </div>
      )}
      <DataTableV2<LandingPage>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyTitle="Chưa có landing page nào"
        emptyDescription="Tạo landing page để chạy chiến dịch marketing."
      />
    </div>
  );
}
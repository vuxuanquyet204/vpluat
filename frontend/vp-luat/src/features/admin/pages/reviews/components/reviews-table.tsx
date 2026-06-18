'use client';

import { useMemo } from 'react';
import { Star, Check, X as XIcon, Reply, Eye, MessageCircle, CheckSquare, Square, Flag } from 'lucide-react';
import { DataTableV2, type DataTableColumn } from '@/features/admin/components';
import { StatusBadge, type StatusVariant } from '@/features/admin/shared';
import type { Review, ReviewStatus } from '@/features/admin/types';
import { REVIEW_STATUS_LABELS } from '../hooks/use-reviews';

interface ReviewsTableProps {
  data: Review[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onOpenDetail: (review: Review) => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onReply: (review: Review) => void;
  onDelete: (review: Review) => void;
  canModerate: boolean;
  canReply: boolean;
  canDelete: boolean;
}

const STATUS_VARIANT: Record<ReviewStatus, StatusVariant> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 1 }} aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= rating ? '#F59E0B' : 'none'}
          stroke={n <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

export function ReviewsTable({
  data,
  isLoading,
  selectedIds,
  onSelectChange,
  onOpenDetail,
  onApprove,
  onReject,
  onReply,
  onDelete,
  canModerate,
  canReply,
  canDelete,
}: ReviewsTableProps) {
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

  const pendingCount = useMemo(() => data.filter((r) => r.status === 'pending').length, [data]);

  const columns: DataTableColumn<Review>[] = [
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
          aria-label={selectedIds.includes(r.id) ? 'Bỏ chọn' : 'Chọn'}
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
      key: 'author',
      header: 'Khách hàng',
      cell: (r) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.85rem' }}>
            {r.authorName}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{r.authorEmail}</div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Dịch vụ',
      cell: (r) => (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-700)' }}>{r.service}</div>
          {r.lawyer && (
            <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>
              LS. {r.lawyer}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Sao',
      width: 90,
      cell: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: 'content',
      header: 'Nội dung',
      cell: (r) => (
        <div style={{ maxWidth: 360 }}>
          <p
            style={{
              margin: 0,
              color: 'var(--gray-700)',
              fontSize: '0.78rem',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={r.content}
          >
            {r.content}
          </p>
          {r.reply && (
            <p
              style={{
                margin: '4px 0 0 0',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title={r.reply}
            >
              <MessageCircle size={10} /> {r.reply.slice(0, 60)}
              {r.reply.length > 60 ? '...' : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Ngày',
      width: 100,
      cell: (r) => (
        <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
          {new Date(r.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'TT',
      width: 110,
      cell: (r) => (
        <StatusBadge
          variant={STATUS_VARIANT[r.status]}
          label={REVIEW_STATUS_LABELS[r.status]}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 120,
      cell: (r) => (
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            type="button"
            className="action-btn"
            style={{ padding: '4px 6px' }}
            title="Xem chi tiết"
            onClick={() => onOpenDetail(r)}
          >
            <Eye size={11} />
          </button>
          {r.status === 'pending' && canModerate && (
            <>
              <button
                type="button"
                className="action-btn"
                style={{ padding: '4px 6px', color: 'var(--success, #10B981)' }}
                title="Duyệt"
                onClick={() => onApprove(r)}
              >
                <Check size={11} />
              </button>
              <button
                type="button"
                className="action-btn"
                style={{ padding: '4px 6px', color: 'var(--danger, #DC2626)' }}
                title="Từ chối"
                onClick={() => onReject(r)}
              >
                <XIcon size={11} />
              </button>
            </>
          )}
          {canReply && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px', color: 'var(--primary)' }}
              title={r.reply ? 'Sửa phản hồi' : 'Trả lời'}
              onClick={() => onReply(r)}
            >
              <Reply size={11} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="action-btn"
              style={{ padding: '4px 6px' }}
              title="Xóa"
              onClick={() => onDelete(r)}
            >
              <Flag size={11} color="var(--danger, #DC2626)" />
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
          {pendingCount > 0 && canModerate && (
            <span style={{ marginLeft: 8, color: 'var(--warning, #D97706)' }}>
              {pendingCount} chờ duyệt
            </span>
          )}
        </div>
      )}
      <DataTableV2<Review>
        columns={columns}
        data={data}
        isLoading={isLoading}
        rowKey={(r) => r.id}
        emptyTitle="Chưa có đánh giá nào"
        emptyDescription="Đánh giá của khách hàng sẽ xuất hiện tại đây."
      />
    </div>
  );
}
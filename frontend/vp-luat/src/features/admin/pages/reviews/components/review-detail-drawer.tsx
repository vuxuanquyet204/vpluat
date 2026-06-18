'use client';

import { useState } from 'react';
import { Star, Check, X as XIcon, Trash2, MessageCircle, User, Mail, Calendar, Briefcase } from 'lucide-react';
import { Drawer, StatusBadge, type StatusVariant } from '@/features/admin/shared';
import { ReviewReplyForm } from './review-reply-form';
import type { Review, ReviewStatus } from '@/features/admin/types';
import type { ReplyFormValues } from '@/features/admin/schema';
import { REVIEW_STATUS_LABELS } from '../hooks/use-reviews';

interface ReviewDetailDrawerProps {
  review: Review | null;
  onClose: () => void;
  onApprove: (review: Review) => void;
  onReject: (review: Review) => void;
  onDelete: (review: Review) => void;
  onSubmitReply: (review: Review, values: ReplyFormValues) => Promise<void> | void;
  isReplying?: boolean;
  canModerate: boolean;
  canDelete: boolean;
  canReply: boolean;
}

const STATUS_VARIANT: Record<ReviewStatus, StatusVariant> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-label={`${rating} trên 5 sao`}>
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

export function ReviewDetailDrawer({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onSubmitReply,
  isReplying,
  canModerate,
  canDelete,
  canReply,
}: ReviewDetailDrawerProps) {
  const [mode, setMode] = useState<'view' | 'reply'>('view');

  if (!review) {
    return (
      <Drawer isOpen={false} onClose={onClose}>
        <></>
      </Drawer>
    );
  }

  return (
    <Drawer
      isOpen={Boolean(review)}
      onClose={() => {
        onClose();
        setMode('view');
      }}
      title={mode === 'reply' ? `Phản hồi — ${review.authorName}` : `Chi tiết đánh giá — ${review.authorName}`}
      width={520}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header: status + rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <StatusBadge
            variant={STATUS_VARIANT[review.status]}
            label={REVIEW_STATUS_LABELS[review.status]}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={review.rating} size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)' }}>
              {review.rating}.0
            </span>
          </div>
        </div>

        {/* Author info */}
        <div
          style={{
            padding: 12,
            background: 'var(--gray-50)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={12} color="var(--gray-500)" />
            <strong style={{ color: 'var(--gray-700)' }}>{review.authorName}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-600)' }}>
            <Mail size={12} color="var(--gray-500)" /> {review.authorEmail}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-600)' }}>
            <Briefcase size={12} color="var(--gray-500)" /> {review.service}
            {review.lawyer && <span style={{ color: 'var(--gray-400)' }}> · LS. {review.lawyer}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)' }}>
            <Calendar size={12} color="var(--gray-500)" />
            {new Date(review.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>

        {/* Content */}
        <div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--gray-500)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Nội dung đánh giá
          </div>
          <div
            style={{
              padding: 14,
              background: 'var(--gray-50)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: 4,
              color: 'var(--gray-800)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {review.content}
          </div>
        </div>

        {/* Existing reply */}
        {review.reply && mode === 'view' && (
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--gray-500)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <MessageCircle size={11} /> Phản hồi hiện tại
              {review.repliedByName && (
                <span style={{ color: 'var(--gray-400)', textTransform: 'none' }}>
                  · bởi {review.repliedByName}
                </span>
              )}
            </div>
            <div
              style={{
                padding: 12,
                background: 'var(--primary-faint, #EFF3F8)',
                borderRadius: 8,
                color: 'var(--gray-800)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
              }}
            >
              {review.reply}
            </div>
            {review.repliedAt && (
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>
                {new Date(review.repliedAt).toLocaleString('vi-VN')}
              </div>
            )}
          </div>
        )}

        {/* Reply form */}
        {mode === 'reply' && canReply && (
          <ReviewReplyForm
            initial={review.reply}
            onCancel={() => setMode('view')}
            onSubmit={async (values) => {
              await onSubmitReply(review, values);
              setMode('view');
            }}
            isLoading={isReplying}
          />
        )}

        {/* Action buttons */}
        {mode === 'view' && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              paddingTop: 12,
              borderTop: '1px solid var(--gray-200)',
            }}
          >
            {review.status === 'pending' && canModerate && (
              <>
                <button
                  type="button"
                  className="action-btn action-btn--primary"
                  onClick={() => onApprove(review)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Check size={12} /> Duyệt
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => onReject(review)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--danger, #DC2626)',
                  }}
                >
                  <XIcon size={12} /> Từ chối
                </button>
              </>
            )}
            {canReply && (
              <button
                type="button"
                className="action-btn"
                onClick={() => setMode('reply')}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <MessageCircle size={12} /> {review.reply ? 'Sửa phản hồi' : 'Trả lời'}
              </button>
            )}
            <div style={{ flex: 1 }} />
            {canDelete && (
              <button
                type="button"
                className="action-btn"
                onClick={() => onDelete(review)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'var(--danger, #DC2626)',
                }}
              >
                <Trash2 size={12} /> Xóa
              </button>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
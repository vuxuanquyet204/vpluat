'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { canAccessNav } from '@/features/auth/utils/permissions';
import type { Role } from '@/features/auth/utils/permissions';
import { Star, Search, Check, X, Eye } from 'lucide-react';
import { reviewApi, type Review } from '@/lib/api/admin-crm';
import { useApiQuery, useApiMutation } from '@/lib/api/hooks';
import { Modal } from '@/features/shared/ui/modal';
import { notifySuccess, notifyError } from '@/features/admin/lib';
import { Loader2 } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Chờ duyệt', color: '#B45309', bg: '#FEF3C7' },
  APPROVED: { label: 'Đã duyệt', color: '#059669', bg: '#ECFDF5' },
  REJECTED: { label: 'Từ chối', color: '#DC2626', bg: '#FEE2E2' },
  SPAM: { label: 'Spam', color: '#6B7280', bg: '#F3F4F6' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? '#F59E0B' : 'none'}
          stroke={star <= rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ReviewRejectModal({
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Từ chối đánh giá"
      width={480}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--gray-200)',
              background: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              if (!reason.trim()) {
                notifyError('Vui lòng nhập lý do từ chối');
                return;
              }
              onSubmit(reason.trim());
            }}
            disabled={isPending}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: '#DC2626',
              color: 'white',
              borderRadius: 6,
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending && <Loader2 size={14} className="spin" />}
            Xác nhận từ chối
          </button>
        </>
      }
    >
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
          Lý do từ chối *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do từ chối đánh giá này..."
          style={{
            width: '100%',
            minHeight: 120,
            padding: 12,
            border: '1px solid var(--gray-200)',
            borderRadius: 6,
            fontSize: '0.88rem',
            resize: 'vertical',
            outline: 'none',
          }}
          autoFocus
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 6 }}>
          Lý do sẽ được lưu vào lịch sử kiểm duyệt.
        </div>
      </div>
    </Modal>
  );
}

function ReviewDetailModal({
  open,
  onClose,
  review,
}: {
  open: boolean;
  onClose: () => void;
  review: Review | null;
}) {
  if (!review) return null;
  const status = STATUS_CONFIG[review.status] ?? {
    label: review.status,
    color: '#6B7280',
    bg: '#F3F4F6',
  };
  return (
    <Modal open={open} onClose={onClose} title="Chi tiết đánh giá" width={560}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>{review.clientName}</div>
            {review.clientEmail && (
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{review.clientEmail}</div>
            )}
          </div>
          <span style={{
            padding: '4px 10px',
            background: status.bg,
            color: status.color,
            borderRadius: 20,
            fontSize: '0.72rem',
            fontWeight: 600,
          }}>
            {status.label}
          </span>
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 6 }}>Đánh giá</div>
          <StarRating rating={review.rating} />
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 6 }}>Nội dung</div>
          <div style={{
            padding: 14,
            background: 'var(--gray-50)',
            borderRadius: 6,
            fontSize: '0.88rem',
            lineHeight: 1.6,
            color: 'var(--gray-700)',
            whiteSpace: 'pre-wrap',
          }}>
            &quot;{review.contentVi}&quot;
          </div>
        </div>
        {review.lawyerName && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 4 }}>Về luật sư</div>
            <div style={{ fontWeight: 600 }}>{review.lawyerName}</div>
          </div>
        )}
        {review.serviceName && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 4 }}>Dịch vụ</div>
            <div style={{ fontWeight: 600 }}>{review.serviceName}</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--gray-500)' }}>
          <span>Tạo: {formatDate(review.createdAt)}</span>
          {review.moderatedAt && <span>Duyệt: {formatDate(review.moderatedAt)}</span>}
        </div>
        {review.rejectionReason && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: 4 }}>Lý do từ chối</div>
            <div style={{
              padding: 10,
              background: '#FEE2E2',
              borderRadius: 6,
              fontSize: '0.85rem',
              color: '#991B1B',
            }}>
              {review.rejectionReason}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function StaffReviewsPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Review | null>(null);

  const userRole = (session?.user?.role as Role) ?? 'VIEWER';

  const { data, isLoading, error, refetch } = useApiQuery<{
    content: Review[];
    totalElements: number;
  }>(
    ['staff-reviews'],
    '/crm/reviews',
    {
      page: 0,
      size: 100,
      status: filter === 'all' ? undefined : filter,
    },
    {
      enabled: canAccessNav(userRole, 'reviews'),
    }
  );

  const reviews = data?.content ?? [];

  const approveMutation = useApiMutation<Review, { id: string }>(
    'POST',
    (vars) => `/crm/reviews/${vars.id}/publish`,
    {
      onSuccess: () => {
        notifySuccess('Đã duyệt đánh giá');
        refetch();
      },
      onError: (err) => notifyError('Lỗi duyệt', err.message),
    }
  );

  const rejectMutation = useApiMutation<Review, { id: string; reason: string }>(
    'POST',
    (vars) => `/crm/reviews/${vars.id}/reject`,
    {
      onSuccess: () => {
        notifySuccess('Đã từ chối đánh giá');
        setRejectOpen(false);
        setRejectTarget(null);
        refetch();
      },
      onError: (err) => notifyError('Lỗi từ chối', err.message),
    }
  );

  const filteredReviews = reviews.filter((r) => {
    if (search && !r.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;

  if (!canAccessNav(userRole, 'reviews')) {
    return (
      <div className="admin-view">
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Bạn không có quyền truy cập trang này
        </div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="admin-page-header">
        <div className="admin-page-header__left">
          <h1 className="admin-page-header__title">Đánh giá khách hàng</h1>
          <p className="admin-page-header__sub">
            {pendingCount > 0 ? `Có ${pendingCount} đánh giá chờ duyệt` : 'Không có đánh giá chờ duyệt'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'white',
          border: '1px solid var(--gray-200)',
          borderRadius: 8
        }}>
          <Search size={16} style={{ color: 'var(--gray-400)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm đánh giá..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem' }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--gray-200)',
            borderRadius: 8,
            fontSize: '0.88rem',
            background: 'white'
          }}
        >
          <option value="all">Tất cả</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--danger, #DC2626)' }}>
          Lỗi tải dữ liệu: {error.message}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
          {filteredReviews.map((review) => {
            const status = STATUS_CONFIG[review.status] ?? {
              label: review.status,
              color: '#6B7280',
              bg: '#F3F4F6',
            };
            return (
              <div
                key={review.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{review.clientName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                      {review.serviceName ?? 'Dịch vụ'}
                    </div>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: status.bg,
                    color: status.color
                  }}>
                    {status.label}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <StarRating rating={review.rating} />
                </div>

                <div style={{
                  fontSize: '0.88rem',
                  color: 'var(--gray-700)',
                  marginBottom: 12,
                  lineHeight: 1.5
                }}>
                  &quot;{review.contentVi}&quot;
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid var(--gray-100)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                    {formatDate(review.createdAt)}
                  </div>

                  {review.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: '#ECFDF5', color: '#059669', border: 'none' }}
                        onClick={() => approveMutation.mutate({ id: review.id })}
                        disabled={approveMutation.isPending}
                      >
                        <Check size={12} /> Duyệt
                      </button>
                      <button
                        type="button"
                        className="action-btn"
                        style={{ background: '#FEE2E2', color: '#DC2626', border: 'none' }}
                        onClick={() => {
                          setRejectTarget(review);
                          setRejectOpen(true);
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        <X size={12} /> Từ chối
                      </button>
                    </div>
                  )}

                  {review.status !== 'PENDING' && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => {
                        setDetailTarget(review);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye size={12} /> Chi tiết
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !error && filteredReviews.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-400)' }}>
          <Star size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <div>Không có đánh giá nào</div>
        </div>
      )}

      <ReviewRejectModal
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectTarget(null);
        }}
        onSubmit={(reason) => {
          if (rejectTarget) {
            rejectMutation.mutate({ id: rejectTarget.id, reason });
          }
        }}
        isPending={rejectMutation.isPending}
      />

      <ReviewDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailTarget(null);
        }}
        review={detailTarget}
      />
    </div>
  );
}

void reviewApi;
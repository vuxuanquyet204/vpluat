'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMockQuery, ghiAudit, notifySuccess, notifyError, getCurrentUser } from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import type { Review, ReviewReport } from '@/features/admin/types';

export function useUpdateReviewStatus() {
  const qc = useQueryClient();
  return async (reviewId: string, status: Review['status']) => {
    const updated = MockDB.update<Review>('reviews', reviewId, {
      status,
      updatedAt: new Date().toISOString(),
    });
    if (updated) {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      ghiAudit({
        action: status === 'approved' ? 'update' : status === 'rejected' ? 'update' : 'status_change',
        entity: 'review',
        entityId: reviewId,
        entityLabel: updated.authorName,
        diff: { before: { status: 'unknown' }, after: { status } },
      });
    }
    return updated;
  };
}

export function useBulkUpdateReviews() {
  const qc = useQueryClient();
  return async (reviewIds: string[], status: Review['status']) => {
    try {
      for (const id of reviewIds) {
        MockDB.update<Review>('reviews', id, {
          status,
          updatedAt: new Date().toISOString(),
        });
      }
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      ghiAudit({
        action: status === 'approved' ? 'update' : 'update',
        entity: 'review',
        entityId: reviewIds.join(','),
        entityLabel: `${reviewIds.length} reviews`,
      });
      notifySuccess(
        status === 'approved'
          ? `Đã duyệt ${reviewIds.length} đánh giá`
          : `Đã từ chối ${reviewIds.length} đánh giá`,
      );
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
    }
  };
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return async (reviewId: string) => {
    const before = MockDB.getById<Review>('reviews', reviewId);
    const ok = MockDB.delete('reviews', reviewId);
    if (ok) {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      // cleanup reports của review này
      const orphanReports = MockDB.query<ReviewReport>(
        'review_reports',
        (r) => r.reviewId === reviewId,
      ).map((r) => r.id);
      if (orphanReports.length > 0) {
        MockDB.deleteMany('review_reports', orphanReports);
        qc.invalidateQueries({ queryKey: ['admin', 'review_reports'] });
      }
      ghiAudit({
        action: 'delete',
        entity: 'review',
        entityId: reviewId,
        entityLabel: before?.authorName,
      });
    }
    return ok;
  };
}

export function useReplyReview() {
  const qc = useQueryClient();
  return async (reviewId: string, reply: string) => {
    const user = getCurrentUser();
    const updated = MockDB.update<Review>('reviews', reviewId, {
      reply,
      repliedByName: user?.name ?? 'Admin',
      repliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (updated) {
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      ghiAudit({
        action: 'update',
        entity: 'review',
        entityId: reviewId,
        entityLabel: updated.authorName,
      });
      notifySuccess('Đã gửi phản hồi');
    }
    return updated;
  };
}

export function useResolveReport() {
  const qc = useQueryClient();
  return async (
    reportId: string,
    action: 'delete_review' | 'reject_review' | 'dismiss_report',
    note?: string,
  ) => {
    const user = getCurrentUser();
    const report = MockDB.getById<ReviewReport>('review_reports', reportId);
    if (!report) {
      notifyError('Lỗi', 'Không tìm thấy báo cáo');
      return;
    }
    const now = new Date().toISOString();
    let labelSuffix = '';
    try {
      if (action === 'delete_review') {
        MockDB.delete('reviews', report.reviewId);
        MockDB.update<ReviewReport>('review_reports', reportId, {
          status: 'resolved',
          resolvedAt: now,
          resolvedByName: user?.name ?? 'Admin',
        });
        labelSuffix = 'review deleted';
        notifySuccess('Đã xóa đánh giá bị báo cáo');
      } else if (action === 'reject_review') {
        const rev = MockDB.getById<Review>('reviews', report.reviewId);
        MockDB.update<Review>('reviews', report.reviewId, {
          status: 'rejected',
          updatedAt: now,
        });
        MockDB.update<ReviewReport>('review_reports', reportId, {
          status: 'resolved',
          resolvedAt: now,
          resolvedByName: user?.name ?? 'Admin',
        });
        labelSuffix = `review ${rev?.id ?? ''} rejected`;
        notifySuccess('Đã từ chối đánh giá bị báo cáo');
      } else {
        MockDB.update<ReviewReport>('review_reports', reportId, {
          status: 'dismissed',
          resolvedAt: now,
          resolvedByName: user?.name ?? 'Admin',
        });
        labelSuffix = 'report dismissed';
        notifySuccess('Đã bỏ qua báo cáo');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'review_reports'] });
      qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      ghiAudit({
        action: 'update',
        entity: 'review_report',
        entityId: reportId,
        entityLabel: `${report.reviewId} — ${labelSuffix}${note ? ` (${note})` : ''}`,
      });
    } catch (e) {
      notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xử lý');
    }
  };
}

// expose
useMockQuery;
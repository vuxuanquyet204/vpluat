'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/hooks';
import { reviewApi } from '@/lib/api/admin-crm';
import { ghiAudit, notifySuccess, notifyError } from '@/features/admin/lib';
import type { Review } from '@/features/admin/pages/reviews/hooks/use-reviews';

export function useApproveReview() {
  const qc = useQueryClient();

  const mutation = useApiMutation(
    'POST',
    (id: string) => `/crm/reviews/${id}/publish`,
    {
      onSuccess: (data, id) => {
        qc.invalidateQueries({ queryKey: ['reviews'] });
        ghiAudit({
          action: 'update',
          entity: 'review',
          entityId: id,
          entityLabel: (data as { lawyerName?: string }).lawyerName,
          diff: { before: { status: 'PENDING' }, after: { status: 'APPROVED' } },
        });
        notifySuccess('Đã duyệt đánh giá');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể duyệt đánh giá');
      },
    },
  );

  return useCallback(
    (id: string) => mutation.mutate(id),
    [mutation],
  );
}

export function useRejectReview() {
  const qc = useQueryClient();

  const mutation = useApiMutation(
    'POST',
    (vars: { id: string; reason: string }) => `/crm/reviews/${vars.id}/reject`,
    {
      onSuccess: (data, vars) => {
        qc.invalidateQueries({ queryKey: ['reviews'] });
        ghiAudit({
          action: 'update',
          entity: 'review',
          entityId: vars.id,
          entityLabel: (data as { lawyerName?: string }).lawyerName,
          diff: { before: { status: 'PENDING' }, after: { status: 'REJECTED' } },
        });
        notifySuccess('Đã từ chối đánh giá');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể từ chối đánh giá');
      },
    },
  );

  return useCallback(
    (id: string, reason: string) => mutation.mutate({ id, reason }),
    [mutation],
  );
}

export function useToggleFeaturedReview() {
  const qc = useQueryClient();

  const mutation = useApiMutation(
    'POST',
    (id: string) => `/crm/reviews/${id}/publish`,
    {
      onSuccess: (_, id) => {
        qc.invalidateQueries({ queryKey: ['reviews'] });
        ghiAudit({
          action: 'update',
          entity: 'review',
          entityId: id,
          entityLabel: 'review',
        });
        notifySuccess('Đã cập nhật nổi bật');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật nổi bật');
      },
    },
  );

  return useCallback(
    (id: string) => mutation.mutate(id),
    [mutation],
  );
}

export function useDeleteReview() {
  const qc = useQueryClient();

  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id: string) => `/crm/reviews/${id}`,
    {
      onSuccess: (_, id) => {
        qc.invalidateQueries({ queryKey: ['reviews'] });
        ghiAudit({
          action: 'delete',
          entity: 'review',
          entityId: id,
          entityLabel: 'review',
        });
        notifySuccess('Đã xóa đánh giá');
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa đánh giá');
      },
    },
  );

  return useCallback(
    (id: string) => mutation.mutate(id),
    [mutation],
  );
}

export function useBulkModerate() {
  const qc = useQueryClient();

  const mutation = useApiMutation<
    { succeeded: number; failed: number; failedIds: string[] },
    { ids: string[]; action: 'APPROVE' | 'REJECT'; reason?: string }
  >(
    'POST',
    '/crm/reviews/bulk/moderate',
    {
      onSuccess: (result, vars) => {
        qc.invalidateQueries({ queryKey: ['reviews'] });
        ghiAudit({
          action: 'update',
          entity: 'review',
          entityId: vars.ids.join(','),
          entityLabel: `${vars.ids.length} reviews`,
        });
        if (result.failed === 0) {
          notifySuccess(
            vars.action === 'APPROVE'
              ? `Đã duyệt ${result.succeeded} đánh giá`
              : `Đã từ chối ${result.succeeded} đánh giá`,
          );
        } else {
          notifyError(
            'Lỗi',
            `${result.failed}/${vars.ids.length} đánh giá thất bại`,
          );
        }
      },
      onError: (e) => {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xử lý hàng loạt');
      },
    },
  );

  return useCallback(
    (ids: string[], action: 'APPROVE' | 'REJECT', reason?: string) =>
      mutation.mutate({ ids, action, reason }),
    [mutation],
  );
}

export function useReplyReview() {
  return useCallback((_reviewId: string, _reply: string) => {
    notifyError('Không hỗ trợ', 'Chức năng chưa hỗ trợ ở backend');
  }, []);
}

// ─── Legacy forwarding hooks (stubs) ─────────────────────────────────────────
// Keep old export names so pages that haven't been migrated yet don't break.

export function useUpdateReviewStatus() {
  const approve = useApproveReview();
  const reject = useRejectReview();
  return useCallback(
    async (reviewId: string, status: Review['status']) => {
      if (status === 'approved') return approve(reviewId);
      if (status === 'rejected') return reject(reviewId, 'Rejected by admin');
      return;
    },
    [approve, reject],
  );
}

export function useBulkUpdateReviews() {
  const bulkModerate = useBulkModerate();
  return useCallback(
    async (reviewIds: string[], status: Review['status']) => {
      const action = status === 'approved' ? 'APPROVE' : 'REJECT';
      return bulkModerate(reviewIds, action);
    },
    [bulkModerate],
  );
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useCallback(
    async (
      _reportId: string,
      action: 'delete_review' | 'reject_review' | 'dismiss_report',
      _note?: string,
    ) => {
      if (action === 'dismiss_report') {
        notifySuccess('Đã bỏ qua báo cáo');
        return;
      }
      notifyError('Không hỗ trợ', 'Chức năng chưa hỗ trợ ở backend');
      qc.invalidateQueries({ queryKey: ['review_reports'] });
    },
    [qc],
  );
}

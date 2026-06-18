'use client';

import { useMemo } from 'react';
import { useMockQuery } from '@/features/admin/lib';
import type { Review, ReviewReport, ReviewStatus, ReportStatus } from '@/features/admin/types';

export function useReviews(filter?: (r: Review) => boolean) {
  const { data = [], ...rest } = useMockQuery<Review>('reviews', filter, {
    by: 'createdAt',
    dir: 'desc',
  });

  const counts = useMemo(() => {
    const c = { total: data.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of data) {
      if (r.status === 'pending') c.pending += 1;
      else if (r.status === 'approved') c.approved += 1;
      else if (r.status === 'rejected') c.rejected += 1;
    }
    return c;
  }, [data]);

  return { data, counts, ...rest };
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export function useRatingBreakdown() {
  const { data = [] } = useMockQuery<Review>('reviews', (r) => r.status === 'approved');

  return useMemo(() => {
    const total = data.length;
    const counts = [1, 2, 3, 4, 5].map((stars) => {
      const count = data.filter((r) => r.rating === stars).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { stars, count, percentage };
    });
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? sum / total : 0;
    return { breakdown: counts.reverse() as RatingBreakdown[], average, total };
  }, [data]);
}

export function useReviewReports(filter?: (r: ReviewReport) => boolean) {
  const { data = [], ...rest } = useMockQuery<ReviewReport>('review_reports', filter, {
    by: 'createdAt',
    dir: 'desc',
  });
  const counts = useMemo(() => {
    const c = { total: data.length, pending: 0, resolved: 0, dismissed: 0 };
    for (const r of data) {
      if (r.status === 'pending') c.pending += 1;
      else if (r.status === 'resolved') c.resolved += 1;
      else if (r.status === 'dismissed') c.dismissed += 1;
    }
    return c;
  }, [data]);
  return { data, counts, ...rest };
}

export const REPORT_REASON_LABELS: Record<string, string> = {
  spam: 'Spam / Quảng cáo',
  inappropriate: 'Không phù hợp',
  fake: 'Đánh giá giả',
  offensive: 'Xúc phạm / Công kích',
  other: 'Khác',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Chờ xử lý',
  resolved: 'Đã xử lý',
  dismissed: 'Bỏ qua',
};
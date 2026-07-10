'use client';

import { useMemo } from 'react';
import { useApiQuery } from '@/lib/api/hooks';
import type { PageResponse } from '@/lib/api/hooks';
import { reviewApi } from '@/lib/api/admin-crm';
import type { Review as ApiReview } from '@/lib/api/admin-crm';

// ─── Types matching what pages/components expect ──────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'spam';
export interface Review {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  content: string;
  rating: number;
  lawyerId?: string;
  lawyerName?: string;
  serviceId?: string;
  service?: string;
  status: ReviewStatus;
  reply?: string;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reason: string;
  description?: string;
  reportedByName?: string;
  reporterEmail?: string;
  content?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedByName?: string;
  createdAt: string;
}

// ─── Mappers from API shape to page-expected shape ────────────────────────────

function mapReview(raw: ApiReview): Review {
  return {
    id: raw.id,
    authorName: raw.clientName,
    authorEmail: raw.clientEmail,
    authorRole: raw.clientRole,
    content: raw.contentVi ?? '',
    rating: raw.rating,
    lawyerId: raw.lawyerId,
    lawyerName: raw.lawyerName,
    serviceId: raw.serviceId,
    service: raw.serviceName,
    status: raw.status === 'PENDING' ? 'pending'
      : raw.status === 'APPROVED' ? 'approved'
      : raw.status === 'REJECTED' ? 'rejected'
      : 'spam',
    reply: undefined,
    createdAt: raw.createdAt,
  };
}

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useReviews(params?: {
  page?: number;
  size?: number;
  status?: string;
  rating?: number;
  lawyerId?: string;
}) {
  const { data, ...rest } = useApiQuery<PageResponse<ApiReview>>(
    ['reviews'],
    '/crm/reviews',
    params,
  );

  const reviews = (data?.content ?? []).map(mapReview);

  const counts = useMemo(() => {
    const c = {
      total: data?.totalElements ?? reviews.length,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const r of reviews) {
      if (r.status === 'pending') c.pending += 1;
      else if (r.status === 'approved') c.approved += 1;
      else if (r.status === 'rejected') c.rejected += 1;
    }
    return c;
  }, [data, reviews]);

  return {
    data: reviews,
    counts,
    page: data?.page,
    size: data?.size,
    totalElements: data?.totalElements,
    totalPages: data?.totalPages,
    ...rest,
  };
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percentage: number;
}

export function useRatingBreakdown() {
  const { data } = useApiQuery<PageResponse<ApiReview>>(
    ['reviews'],
    '/crm/reviews',
    { status: 'APPROVED', size: 1000 },
  );

  return useMemo(() => {
    const content = (data?.content ?? []).map(mapReview);
    const total = content.length;
    const counts = [1, 2, 3, 4, 5].map((stars) => {
      const count = content.filter((r) => r.rating === stars).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { stars, count, percentage };
    });
    const sum = content.reduce((acc, r) => acc + r.rating, 0);
    const average = total > 0 ? sum / total : 0;
    return { breakdown: counts.reverse() as RatingBreakdown[], average, total };
  }, [data]);
}

export function usePendingReviews(page = 0, size = 20) {
  const result = useApiQuery<PageResponse<ApiReview>>(
    ['reviews', 'pending'],
    '/crm/reviews/pending',
    { page, size },
  );
  return {
    ...result,
    data: result.data?.content.map(mapReview) ?? [],
  };
}

export function useReviewReports() {
  // No API endpoint for reports yet — return empty
  return {
    data: [] as ReviewReport[],
    counts: { total: 0, pending: 0, resolved: 0, dismissed: 0 },
    isLoading: false,
    isError: false,
    isSuccess: true,
    refetch: () => Promise.resolve({ data: [] as ReviewReport[], error: null, status: 'success' as const }),
  };
}

export const REPORT_REASON_LABELS: Record<string, string> = {
  spam: 'Spam / Quảng cáo',
  inappropriate: 'Không phù hợp',
  fake: 'Đánh giá giả',
  offensive: 'Xúc phạm / Công kích',
  other: 'Khác',
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  spam: 'Spam',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  resolved: 'Đã xử lý',
  dismissed: 'Bỏ qua',
};

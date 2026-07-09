// features/home/hooks/use-reviews.ts
// React hooks for fetching reviews from API

import { useQuery } from '@tanstack/react-query';
import { getReviews, getFeaturedReviews, getRecentReviews, type ReviewApiResponse } from '../api/reviews-api';

export function useReviews() {
  return useQuery<ReviewApiResponse[], Error>({
    queryKey: ['reviews'],
    queryFn: getReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedReviews() {
  return useQuery<ReviewApiResponse[], Error>({
    queryKey: ['reviews', 'featured'],
    queryFn: getFeaturedReviews,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentReviews(limit = 10) {
  return useQuery<ReviewApiResponse[], Error>({
    queryKey: ['reviews', 'recent', limit],
    queryFn: () => getRecentReviews(limit),
    staleTime: 5 * 60 * 1000,
  });
}

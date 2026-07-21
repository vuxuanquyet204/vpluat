// features/lawyers/hooks/use-lawyers.ts
// React hooks for fetching lawyers from API

import { useQuery } from '@tanstack/react-query';
import { 
  getLawyers, 
  getFeaturedLawyers, 
  getLawyerBySlug,
  searchLawyers,
  type LawyerApiResponse 
} from '../api/lawyers-api';

export function useLawyers(page = 0, size = 20, serviceSlug?: string) {
  return useQuery<LawyerApiResponse[], Error>({
    queryKey: ['lawyers', page, size, serviceSlug],
    queryFn: () => getLawyers(page, size, serviceSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedLawyers() {
  return useQuery<LawyerApiResponse[], Error>({
    queryKey: ['lawyers', 'featured'],
    queryFn: getFeaturedLawyers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLawyerBySlug(slug: string) {
  return useQuery<LawyerApiResponse | null, Error>({
    queryKey: ['lawyers', 'detail', slug],
    queryFn: () => getLawyerBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchLawyers(query: string) {
  return useQuery<LawyerApiResponse[], Error>({
    queryKey: ['lawyers', 'search', query],
    queryFn: () => searchLawyers(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

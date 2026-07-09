// features/services/hooks/use-services.ts
// React hooks for fetching services from API

import { useQuery } from '@tanstack/react-query';
import { getServices, getFeaturedServices, getServiceBySlug, type ServiceApiResponse } from '../api/services-api';

export function useServices() {
  return useQuery<ServiceApiResponse[], Error>({
    queryKey: ['services'],
    queryFn: getServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedServices() {
  return useQuery<ServiceApiResponse[], Error>({
    queryKey: ['services', 'featured'],
    queryFn: getFeaturedServices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useServiceBySlug(slug: string) {
  return useQuery<ServiceApiResponse | null, Error>({
    queryKey: ['services', 'detail', slug],
    queryFn: () => getServiceBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

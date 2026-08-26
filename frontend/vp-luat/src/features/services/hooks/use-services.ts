// features/services/hooks/use-services.ts
// React hooks for fetching services from API

import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getServices, getFeaturedServices, getServiceBySlug, type ServiceApiResponse } from '../api/services-api';

export function useServices() {
  const locale = useLocale();
  return useQuery<ServiceApiResponse[], Error>({
    queryKey: ['services', locale],
    queryFn: () => getServices(locale),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeaturedServices() {
  const locale = useLocale();
  return useQuery<ServiceApiResponse[], Error>({
    queryKey: ['services', 'featured', locale],
    queryFn: () => getFeaturedServices(locale),
    staleTime: 5 * 60 * 1000,
  });
}

export function useServiceBySlug(slug: string) {
  const locale = useLocale();
  return useQuery<ServiceApiResponse | null, Error>({
    queryKey: ['services', 'detail', slug, locale],
    queryFn: () => getServiceBySlug(slug, locale),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

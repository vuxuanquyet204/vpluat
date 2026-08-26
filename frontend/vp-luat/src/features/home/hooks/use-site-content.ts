import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { getPublicSiteContent, type PublicSiteContent } from '../api/site-content-api';

export function usePublicSiteContent() {
  const locale = useLocale();
  return useQuery<PublicSiteContent, Error>({
    queryKey: ['public', 'site-content', locale],
    queryFn: () => getPublicSiteContent(locale),
    staleTime: 10 * 60 * 1000,
  });
}

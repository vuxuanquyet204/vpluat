import type { MetadataRoute } from 'next';
import { publicPageSlugs } from '@/features/landing-pages';
import { buildAbsoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: buildAbsoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildAbsoluteUrl('/login'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ];

  const publicRoutes: MetadataRoute.Sitemap = publicPageSlugs.map((slug) => ({
    url: buildAbsoluteUrl(`/${slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: slug === 'lien-he' ? 0.9 : 0.8,
  }));

  return [...staticRoutes, ...publicRoutes];
}

import type { MetadataRoute } from 'next';
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

  return staticRoutes;
}

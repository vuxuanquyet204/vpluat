import type { MetadataRoute } from 'next';
import { buildAbsoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login'],
    },
    sitemap: buildAbsoluteUrl('sitemap.xml'),
  };
}

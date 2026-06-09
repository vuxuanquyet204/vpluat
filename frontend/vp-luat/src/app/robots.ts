import type { MetadataRoute } from 'next';
import { publicPageSlugs } from '@/features/landing-pages';
import { buildAbsoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', ...publicPageSlugs.map((slug) => `/${slug}`), '/login'],
    },
    sitemap: buildAbsoluteUrl('sitemap.xml'),
  };
}

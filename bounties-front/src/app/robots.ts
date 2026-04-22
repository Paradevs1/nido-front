import type { MetadataRoute } from 'next';
import { BRAND_SITE_URL } from '@/lib/branding/links';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${BRAND_SITE_URL}/sitemap.xml`,
  };
}

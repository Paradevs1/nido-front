import type { MetadataRoute } from 'next';
import { BRAND_SITE_URL } from '@/lib/branding/links';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BRAND_SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BRAND_SITE_URL}/campaigns`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BRAND_SITE_URL}/waitlist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BRAND_SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BRAND_SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}

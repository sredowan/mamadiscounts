import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/checkout/', '/merchant/dashboard/'],
    },
    sitemap: 'https://couponusbd.com/sitemap.xml',
  };
}

import { MetadataRoute } from 'next';
import { DHAKA_AREAS, CITIES, CATEGORIES } from '@/lib/constants';
import { DEMO_DEALS } from '@/lib/demo-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://couponusbd.com';

  // Base routes
  const staticRoutes = [
    '',
    '/deals',
    '/search',
    '/customer/login',
    '/auth/register',
    '/merchant/login',
    '/admin/login',
    '/about',
    '/merchant',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Categories
  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Cities
  const cityRoutes = CITIES.map((city) => ({
    url: `${baseUrl}/browse/${city.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Dhaka Areas (The big SEO farm)
  const dhakaAreaRoutes = DHAKA_AREAS.map((area) => ({
    url: `${baseUrl}/browse/dhaka/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Deal Details
  const dealRoutes = DEMO_DEALS.map((deal) => ({
    url: `${baseUrl}/deals/${deal.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...cityRoutes,
    ...dhakaAreaRoutes,
    ...dealRoutes,
  ];
}

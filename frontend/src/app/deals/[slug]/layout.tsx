import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMO_DEALS } from '@/lib/demo-data';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const deal = DEMO_DEALS.find((d) => d.slug === resolvedParams.slug);
  
  if (!deal) return {
    title: "Deal Details | COUPONUS BD",
    description: "View incredible deals and discounts on COUPONUS BD.",
  };

  return {
    title: `${deal.title} | COUPONUS BD`,
    description: deal.description.substring(0, 160),
    openGraph: {
      title: deal.title,
      description: deal.description,
      images: [deal.images[0] || ''],
      url: `https://couponusbd.com/deals/${deal.slug}`,
    },
    alternates: {
      canonical: `https://couponusbd.com/deals/${deal.slug}`,
    },
  };
}

export default async function DealLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const deal = DEMO_DEALS.find((d) => d.slug === resolvedParams.slug);
  if (!deal) return <>{children}</>;

  // Generate Google Structured Data (JSON-LD) for Product/Offer
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    image: deal.images,
    description: deal.description,
    sku: deal.id,
    brand: {
      '@type': 'LocalBusiness',
      name: deal.merchant.businessName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: deal.merchant.address,
        addressLocality: deal.merchant.area,
        addressRegion: deal.merchant.city,
        addressCountry: 'BD',
      },
    },
    offers: {
      '@type': 'AggregateOffer',
      url: `https://couponusbd.com/deals/${deal.slug}`,
      priceCurrency: 'BDT',
      lowPrice: Math.min(...deal.options.map(o => o.dealPrice)),
      highPrice: Math.max(...deal.options.map(o => o.originalPrice)),
      offerCount: deal.options.length,
      availability: 'https://schema.org/InStock',
      priceValidUntil: deal.endDate,
    },
    aggregateRating: deal.ratingCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: deal.ratingAvg,
      reviewCount: deal.ratingCount,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

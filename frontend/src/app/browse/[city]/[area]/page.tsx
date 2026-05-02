import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DealCard } from '@/components/deals/DealCard';
import { CITIES, DHAKA_AREAS, DNCC_ZONES, DSCC_AREAS } from '@/lib/constants';
import { DEMO_DEALS } from '@/lib/demo-data';
import styles from './page.module.css';
import Link from 'next/link';

interface Props {
  params: {
    city: string;
    area: string;
  };
}

export function generateMetadata({ params }: Props): Metadata {
  const city = CITIES.find((c) => c.id === params.city);
  if (!city) return notFound();

  const areaSlug = params.area;
  const area = DHAKA_AREAS.find((a) => a.slug === areaSlug);
  
  if (!area) return notFound();

  return {
    title: `Best Deals in ${area.name}, ${city.name} | COUPONUS BD`,
    description: `Discover top exclusive deals and discounts in ${area.name}, ${city.name}. Save up to 75% on Spa, Food, Activities, Health & Fitness in ${area.name}.`,
    keywords: `deals in ${area.name}, discounts in ${area.name}, ${area.name} coupon, spa in ${area.name}, food in ${area.name}`,
    alternates: {
      canonical: `https://couponusbd.com/browse/${city.id}/${area.slug}`,
    },
  };
}

export default function AreaBrowsePage({ params }: Props) {
  const city = CITIES.find((c) => c.id === params.city);
  if (!city) return notFound();

  const areaSlug = params.area;
  const area = DHAKA_AREAS.find((a) => a.slug === areaSlug);
  if (!area) return notFound();

  // For demo, we just filter the DEMO_DEALS by checking if the merchant area contains the area name.
  // In production, this would be a server component fetching from the API.
  const areaDeals = DEMO_DEALS.filter(d => 
    d.merchant.area.toLowerCase().includes(area.name.toLowerCase()) || 
    area.name.toLowerCase().includes(d.merchant.area.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* City Hero */}
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            Deals in <span className={styles.highlight}>{area.name}</span>, {city.name}
          </h1>
          <p className={styles.subtitle}>
            Explore the best offers in {area.name} ({area.corporation} {area.zone}).
          </p>
        </div>
      </div>

      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link> &gt;{' '}
          <Link href={`/browse/${city.id}`}>{city.name}</Link> &gt;{' '}
          <span>{area.name}</span>
        </nav>

        {areaDeals.length > 0 ? (
          <div className="deal-grid">
            {areaDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No deals currently available in {area.name}</h2>
            <p>Check back later or explore deals in nearby popular areas.</p>
            <div className={styles.nearbyAreas}>
              {city.popularAreas.slice(0, 5).map(popArea => (
                 <Link 
                   key={popArea} 
                   href={`/browse/${city.id}/${popArea.toLowerCase().replace(/[\s/]+/g, "-")}`}
                   className={styles.areaChip}
                 >
                   {popArea}
                 </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

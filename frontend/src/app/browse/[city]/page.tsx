import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DealCard } from '@/components/deals/DealCard';
import { CITIES, DHAKA_AREAS } from '@/lib/constants';
import { DEMO_DEALS } from '@/lib/demo-data';
import styles from './page.module.css';
import Link from 'next/link';

interface Props {
  params: {
    city: string;
  };
}

export function generateMetadata({ params }: Props): Metadata {
  const city = CITIES.find((c) => c.id === params.city);
  if (!city) return notFound();

  return {
    title: `Best Deals in ${city.name} | COUPONUS BD`,
    description: `Discover top exclusive deals and discounts in ${city.name}. Save up to 75% on Spa, Food, Activities, Health & Fitness in ${city.name}.`,
    alternates: {
      canonical: `https://couponusbd.com/browse/${city.id}`,
    },
  };
}

export default function CityBrowsePage({ params }: Props) {
  const city = CITIES.find((c) => c.id === params.city);
  if (!city) return notFound();

  // For demo
  const cityDeals = DEMO_DEALS.filter(d => d.merchant.city.toLowerCase() === city.name.toLowerCase());

  const isDhaka = city.id === 'dhaka';

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            Discover <span className={styles.highlight}>{city.name}</span>
          </h1>
          <p className={styles.subtitle}>
            Best local deals, updated daily.
          </p>
        </div>
      </div>

      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link> &gt; {' '}
          <span>{city.name}</span>
        </nav>

        {/* Popular Areas Quick Links */}
        <div className={styles.popularSection}>
          <h3>Popular in {city.name}</h3>
          <div className={styles.areaTags}>
            {city.popularAreas.map(area => (
              <Link 
                 key={area} 
                 href={`/browse/${city.id}/${area.toLowerCase().replace(/[\s/]+/g, "-")}`}
                 className={styles.areaChip}
              >
                {area}
              </Link>
            ))}
          </div>
        </div>

        <h2 className="section-title">Deals in {city.name}</h2>
        {cityDeals.length > 0 ? (
          <div className="deal-grid">
            {cityDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No deals currently available in {city.name}</h2>
            <p>Check back later or change your location.</p>
          </div>
        )}

        {isDhaka && (
          <div className={styles.allAreasSection}>
            <h2 className="section-title">Explore All Dhaka Areas</h2>
            <div className={styles.areaColumns}>
              {DHAKA_AREAS.slice(0, 40).map(area => (
                <Link 
                  key={area.slug} 
                  href={`/browse/dhaka/${area.slug}`}
                  className={styles.areaLink}
                >
                  {area.name} <span className={styles.corpLabel}>({area.corporation})</span>
                </Link>
              ))}
            </div>
            <p className={styles.viewMore}>...and many more.</p>
          </div>
        )}
      </div>
    </div>
  );
}

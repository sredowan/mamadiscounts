"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck, MapPin, Navigation, Phone,
  ShoppingBag, Star, Store, Tag,
} from "lucide-react";
import { DealCard } from "@/components/deals/DealCard";
import { formatCount } from "@/lib/utils";
import { DEMO_DEALS } from "@/lib/demo-data";
import { DEAL_STORE_CHANGED, getMarketplaceDeals } from "@/lib/deal-store";
import type { Deal, MerchantSummary } from "@/types";
import styles from "./page.module.css";

/** Create a URL-safe slug from a business name */
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Group deals by merchant id */
function getMerchantDeals(deals: Deal[], merchantId: string) {
  return deals.filter((d) => d.merchant.id === merchantId);
}

/** Find merchant info from any of their deals */
function findMerchant(deals: Deal[], slug: string): { merchant: MerchantSummary; merchantDeals: Deal[] } | null {
  for (const deal of deals) {
    if (toSlug(deal.merchant.businessName) === slug || deal.merchant.id === slug) {
      return {
        merchant: deal.merchant,
        merchantDeals: getMerchantDeals(deals, deal.merchant.id),
      };
    }
  }
  return null;
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);

  useEffect(() => {
    const refresh = () => setDeals(getMarketplaceDeals());
    queueMicrotask(refresh);
    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const result = findMerchant(deals, slug);

  if (!result) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <Store size={48} />
          <h1 className={styles.emptyTitle}>Brand not found</h1>
          <p className={styles.emptySub}>This merchant page doesn&apos;t exist or has no active deals.</p>
          <Link href="/" style={{ color: "var(--color-primary-600)", fontWeight: 600, fontSize: "0.9rem" }}>← Browse all deals</Link>
        </div>
      </div>
    );
  }

  const { merchant, merchantDeals } = result;
  const activeDeals = merchantDeals.filter((d) => d.status === "active");
  const totalSold = merchantDeals.reduce((sum, d) => sum + d.quantitySold, 0);

  return (
    <div className={styles.page}>
      {/* ── Hero Banner ────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroBg2} />
        <div className={styles.heroInner}>
          <div className={styles.avatar}>
            {merchant.businessName.charAt(0)}
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.businessName}>{merchant.businessName}</h1>
            {merchant.isVerified && (
              <span className={styles.verifiedBadge}>
                <BadgeCheck size={12} /> Verified Merchant
              </span>
            )}
            <div className={styles.heroMeta}>
              <span className={styles.heroMetaItem}>
                <MapPin size={14} /> {merchant.area}, {merchant.city}
              </span>
              <span className={styles.heroMetaItem}>
                <Star size={14} /> {merchant.ratingAvg} ({formatCount(merchant.ratingCount)})
              </span>
              <span className={styles.heroMetaItem}>
                <Tag size={14} /> {activeDeals.length} active deals
              </span>
            </div>
            <div className={styles.heroActions}>
              <button className={`${styles.heroBtn} ${styles.heroBtnPrimary}`} type="button">
                <Phone size={15} /> Call
              </button>
              <button className={styles.heroBtn} type="button">
                <Navigation size={15} /> Directions
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ────────────────────────── */}
      <div className={styles.content}>
        {/* All Deals by this brand */}
        <section className={styles.dealSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Deals by {merchant.businessName}</h2>
              <p className={styles.sectionSub}>All active promotions and packages</p>
            </div>
            <span className={styles.sectionCount}>
              <ShoppingBag size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> {activeDeals.length} deals
            </span>
          </div>
          {activeDeals.length > 0 ? (
            <div className="deal-grid">
              {activeDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Tag size={36} />
              <p className={styles.emptyTitle}>No active deals</p>
              <p className={styles.emptySub}>This merchant has no active deals right now. Check back soon!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

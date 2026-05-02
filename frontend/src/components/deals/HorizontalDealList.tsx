"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getMarketplaceDeals } from "@/lib/deal-store";
import { DealCard } from "./DealCard";
import type { Deal } from "@/types";
import styles from "./HorizontalDealList.module.css";

interface Props {
  title: string;
  subtitle?: string;
  filterType: "mega" | "great";
  viewAllLink?: string;
}

export function HorizontalDealList({ title, subtitle, filterType, viewAllLink }: Props) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allDeals = getMarketplaceDeals();
    const filterFn = (deal: Deal) => {
      if (filterType === "mega") return deal.discountPercent >= 50;
      if (filterType === "great") return deal.discountPercent > 0 && deal.discountPercent < 50;
      return true;
    };
    setDeals(allDeals.filter(filterFn).slice(0, 8)); // Max 8 items for horizontal scroll
  }, [filterType]);

  if (!isClient || deals.length === 0) return null;

  return (
    <section className={`section ${styles.wrapper}`}>
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="section-link">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className={styles.scrollContainer}>
          {deals.map((deal) => (
            <div key={deal.id} className={styles.cardWrapper}>
              <DealCard deal={deal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

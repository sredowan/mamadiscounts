import Link from "next/link";
import { Flame, Sparkles, Star } from "lucide-react";
import { CampaignSlider } from "@/components/home/CampaignSlider";
import { NearbyDealsSection } from "@/components/deals/MarketplaceDealGrid";
import { HorizontalDealList } from "@/components/deals/HorizontalDealList";
import { SponsoredVoucherPromotions } from "@/components/promotions/HomepagePromotions";
import { CATEGORIES } from "@/lib/constants";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      {/* 1) HERO SLIDER - Full Width */}
      <section className={styles.heroCampaignWrapper}>
        <CampaignSlider />
      </section>

      {/* 2) PRIMARY ACTION CATEGORIES (Circular Icons) */}
      <section className={`section ${styles.primaryActionSection}`}>
        <div className="container">
          <div className={styles.actionGrid}>
            <Link href="/search?q=deal of the week" className={styles.actionItem}>
              <div className={`${styles.actionIcon} ${styles.actionIconPrimary}`}>
                <Flame size={28} />
              </div>
              <span className={styles.actionLabel}>Deal of the week</span>
            </Link>
            <Link href="/search?q=new arrivals" className={styles.actionItem}>
              <div className={`${styles.actionIcon} ${styles.actionIconSecondary}`}>
                <Sparkles size={28} />
              </div>
              <span className={styles.actionLabel}>New Arrivals</span>
            </Link>
            <Link href="/search?q=top brands" className={styles.actionItem}>
              <div className={`${styles.actionIcon} ${styles.actionIconTertiary}`}>
                <Star size={28} />
              </div>
              <span className={styles.actionLabel}>Top Brands</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3) SCROLLABLE CATEGORIES — Mobile only (sidebar handles desktop) */}
      <section className={`section ${styles.scrollableCategories} ${styles.mobileOnly}`}>
        <div className="container">
          <div className={styles.categoryScrollWrap}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={styles.categoryItem}
              >
                <div
                  className={styles.categorySquare}
                  style={{ backgroundColor: `${cat.color}14`, color: cat.color } as React.CSSProperties}
                >
                  <cat.icon size={24} />
                </div>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4) PROMOTED / SPONSORED VOUCHERS */}
      <SponsoredVoucherPromotions />

      {/* 4) DEALS UP TO 50-75% (Horizontal Scroll) */}
      <HorizontalDealList
        title="Mega Deals"
        subtitle="Deals up to 50-75% off"
        filterType="mega"
        viewAllLink="/search?sort=discount"
      />

      {/* 5) DEALS UP TO 50% (Horizontal Scroll) */}
      <HorizontalDealList
        title="Great Savings"
        subtitle="Deals up to 50% off"
        filterType="great"
        viewAllLink="/search"
      />

      {/* 6) DEALS NEAR YOU (Main Vertical Feed) */}
      <NearbyDealsSection />
    </>
  );
}

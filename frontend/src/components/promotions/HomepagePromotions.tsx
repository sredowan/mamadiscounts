"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getLivePromotions, type Promotion } from "@/lib/promotion-api";
import {
  getVisiblePromotions,
  PROMOTION_STORE_CHANGED,
  type MerchantPromotion,
} from "@/lib/promotion-store";
import { VoucherTemplate } from "@/components/templates/VoucherTemplate";
import styles from "@/app/page.module.css";

/**
 * Hook: Fetches live promotions from API first, falls back to localStorage
 */
function useLivePromotions(placement: "MAIN_BANNER" | "SPONSORED_VOUCHER") {
  const [promotions, setPromotions] = useState<Array<Promotion | MerchantPromotion>>([]);

  const refresh = useCallback(async () => {
    try {
      // Try API first
      const apiPromos = await getLivePromotions(placement);
      setPromotions(apiPromos);
      return;
    } catch {
      // API unavailable — fall through to localStorage
    }

    // Fallback: localStorage promotions
    const localPlacement = placement === "MAIN_BANNER" ? "main_banner" : "sponsored_voucher";
    setPromotions(getVisiblePromotions(localPlacement));
  }, [placement]);

  useEffect(() => {
    refresh();
    // Also listen for localStorage changes (legacy support)
    window.addEventListener(PROMOTION_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROMOTION_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return promotions;
}

function getPromoField(promo: Promotion | MerchantPromotion, field: string): string {
  return (promo as any)[field] || "";
}

export function MainPromotionBanners() {
  const promotions = useLivePromotions("MAIN_BANNER");

  if (promotions.length === 0) return null;

  return (
    <section className={`section ${styles.mainPromotionSection}`}>
      <div className="container">
        <div className={styles.mainPromotionGrid}>
          {promotions.map((promotion) => (
            <Link key={promotion.id} href={getPromoField(promotion, "linkHref")} className={styles.mainPromotionCard}>
              <img src={getPromoField(promotion, "imageUrl")} alt={promotion.title} className={styles.mainPromotionImage} />
              <span className={styles.promotionOverlayBadge}>Featured banner</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SponsoredVoucherPromotions() {
  const promotions = useLivePromotions("SPONSORED_VOUCHER");

  if (promotions.length > 0) {
    return (
      <section className={`section ${styles.promoSection}`}>
        <div className="container">
          <div className={styles.promoScrollWrap}>
            {promotions.map((promotion) => (
              <Link key={promotion.id} href={getPromoField(promotion, "linkHref")} className={styles.promoBanner} aria-label={promotion.title}>
                {getPromoField(promotion, "templateStyleKey") ? (
                  <VoucherTemplate
                    styleKey={getPromoField(promotion, "templateStyleKey")}
                    data={{
                      templateId: promotion.id,
                      shopLogo: getPromoField(promotion, "templateShopLogo"),
                      productImage: getPromoField(promotion, "templateProductImage"),
                      headline: getPromoField(promotion, "templateHeadline") || promotion.title,
                      subtext: getPromoField(promotion, "templateSubtext"),
                      discountText: getPromoField(promotion, "templateDiscountText"),
                      merchantName: (promotion as any).merchantName || (promotion as any).merchant?.businessName || "",
                    }}
                  />
                ) : (
                  <img src={getPromoField(promotion, "imageUrl")} alt={promotion.title} className={styles.promoImageOnly} />
                )}
                <span className={styles.promotionOverlayBadge}>Sponsored</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback: static demo banners
  return (
    <section className={`section ${styles.promoSection}`}>
      <div className="container">
        <div className={styles.promoScrollWrap}>
          <Link href="/search?sort=discount" className={styles.promoBanner}>
            <div className={`${styles.promoContent} ${styles.promoVoucher}`}>
              <span className={styles.promoBadge}>Sponsored</span>
              <h3 className={styles.promoTitle}>Tk. 175 off</h3>
              <p className={styles.promoDesc}>Min. spend Tk. 300</p>
            </div>
          </Link>
          <Link href="/search?q=cashless" className={styles.promoBanner}>
            <div className={`${styles.promoContent} ${styles.promoCashless}`}>
              <span className={styles.promoBadge}>Bank Promo</span>
              <h3 className={styles.promoTitle}>Up to 25% off</h3>
              <p className={styles.promoDesc}>Pay with selected cards</p>
            </div>
          </Link>
          <Link href="/category/beauty-and-spa" className={styles.promoBanner}>
            <div className={`${styles.promoContent} ${styles.promoExclusive}`}>
              <span className={styles.promoBadge}>Exclusive</span>
              <h3 className={styles.promoTitle}>Spa Day 50% Off</h3>
              <p className={styles.promoDesc}>Pamper yourself today</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

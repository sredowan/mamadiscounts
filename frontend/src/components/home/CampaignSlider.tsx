"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getLivePromotions, type Promotion } from "@/lib/promotion-api";
import {
  getVisiblePromotions,
  PROMOTION_STORE_CHANGED,
  type MerchantPromotion,
} from "@/lib/promotion-store";
import { BannerTemplate } from "@/components/templates/BannerTemplate";
import styles from "./CampaignSlider.module.css";

/* ── Static banners (always present) ─────────────────────── */
const STATIC_BANNERS = [
  {
    id: "static-1",
    image: "/images/hero/slide2.jpg",
    title: "Weekend Brunch Specials",
    subtitle: "Dine like royalty. Discover 5-star hotel buffets up to 40% off across Dhaka.",
    ctaText: "Explore Foods",
    ctaLink: "/category/food-and-drink",
  },
  {
    id: "static-2",
    image: "/images/hero/slide1.png",
    title: "Ultimate Relaxation",
    subtitle: "Treat yourself to top-rated spa packages near you. Limited redemptions.",
    ctaText: "Pamper Yourself",
    ctaLink: "/category/beauty-and-spa",
  },
];

type SlideItem =
  | { kind: "static"; id: string; image: string; title: string; subtitle: string; ctaText: string; ctaLink: string }
  | { kind: "api"; promotion: Promotion }
  | { kind: "local"; promotion: MerchantPromotion };

export function CampaignSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [merchantPromos, setMerchantPromos] = useState<Array<Promotion | MerchantPromotion>>([]);
  const [promoSource, setPromoSource] = useState<"api" | "local">("api");

  /* Load merchant promotions — API first, localStorage fallback */
  const refresh = useCallback(async () => {
    try {
      const apiPromos = await getLivePromotions("MAIN_BANNER");
      setMerchantPromos(apiPromos);
      setPromoSource("api");
      return;
    } catch {
      // API unavailable
    }
    // Fallback to localStorage
    const local = getVisiblePromotions("main_banner");
    setMerchantPromos(local);
    setPromoSource("local");
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(PROMOTION_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROMOTION_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  /* Slot-based merchant banners replace static banners while active. */
  const slides: SlideItem[] = merchantPromos.length > 0
    ? merchantPromos.map((p) => promoSource === "api"
        ? { kind: "api" as const, promotion: p as Promotion }
        : { kind: "local" as const, promotion: p as MerchantPromotion }
      )
    : STATIC_BANNERS.map((b) => ({ kind: "static" as const, ...b }));

  /* Auto-advance */
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToNext = () => setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
  const goToPrev = () => setCurrentSlide((prev) => (prev <= 0 ? slides.length - 1 : prev - 1));

  function getField(slide: SlideItem, field: string): string {
    if (slide.kind === "static") return "";
    return (slide.promotion as any)[field] || "";
  }

  function getMerchantName(slide: SlideItem): string {
    if (slide.kind === "static") return "";
    if (slide.kind === "api") return (slide.promotion as Promotion).merchant?.businessName || "";
    return (slide.promotion as MerchantPromotion).merchantName || "";
  }

  return (
    <div className={styles.campaignSlider}>
      {slides.map((slide, index) => (
        <div
          key={slide.kind === "static" ? slide.id : slide.promotion.id}
          className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
        >
          {slide.kind === "static" ? (
            /* ── Static banner slide ── */
            <>
              <div className={styles.imageOverlay} />
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className={styles.backgroundImage}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              <div className={styles.slideContent}>
                <div className={styles.textWrapper}>
                  <h3 className={styles.title}>{slide.title}</h3>
                  <p className={styles.subtitle}>{slide.subtitle}</p>
                  <Link href={slide.ctaLink} className={styles.ctaButton}>
                    {slide.ctaText}
                  </Link>
                </div>
              </div>
            </>
          ) : getField(slide, "templateStyleKey") ? (
            /* ── Merchant templated banner ── */
            <Link href={getField(slide, "linkHref")} style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}>
              <BannerTemplate
                styleKey={getField(slide, "templateStyleKey")}
                data={{
                  templateId: slide.promotion.id,
                  shopLogo: getField(slide, "templateShopLogo"),
                  productImage: getField(slide, "templateProductImage"),
                  headline: getField(slide, "templateHeadline") || slide.promotion.title,
                  subtext: getField(slide, "templateSubtext"),
                  discountText: getField(slide, "templateDiscountText"),
                  merchantName: getMerchantName(slide),
                }}
              />
            </Link>
          ) : (
            /* ── Merchant raw image banner (fallback) ── */
            <Link href={getField(slide, "linkHref")} style={{ display: "block", width: "100%", height: "100%" }}>
              <img
                src={getField(slide, "imageUrl")}
                alt={slide.promotion.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Link>
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={goToPrev}>
        <ChevronLeft size={20} />
      </button>
      <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={goToNext}>
        <ChevronRight size={20} />
      </button>

      {/* Pagination Dots */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

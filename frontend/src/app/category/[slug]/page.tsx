"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Loader2, Search, Tag } from "lucide-react";
import { DealCard } from "@/components/deals/DealCard";
import { CATEGORIES } from "@/lib/constants";
import { DEAL_STORE_CHANGED, getMarketplaceDeals } from "@/lib/deal-store";
import { API_URL, cn } from "@/lib/utils";
import type { Deal, DealBadge } from "@/types";
import styles from "./page.module.css";

type ApiCategory = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  _count?: { deals?: number };
};

type ApiDeal = Partial<Omit<Deal, "status" | "highlights" | "images" | "options" | "badges">> & {
  status?: string;
  highlights?: unknown;
  images?: unknown;
  options?: unknown;
  badges?: unknown;
};

type SortOption = "popular" | "discount" | "price_asc";

export default function CategoryDealsPage() {
  const params = useParams();
  const categorySlug = typeof params.slug === "string" ? params.slug : "";
  const localCategory = CATEGORIES.find((category) => category.slug === categorySlug);
  const CategoryIcon = localCategory?.icon || Tag;

  const [deals, setDeals] = useState<Deal[]>([]);
  const [apiCategory, setApiCategory] = useState<ApiCategory | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [sortBy, setSortBy] = useState<SortOption>("popular");

  const categoryName = apiCategory?.name || localCategory?.name || toTitle(categorySlug);
  const categoryColor = apiCategory?.color || localCategory?.color || "#0b8043";

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryDeals() {
      setStatus("loading");

      const localDeals = getLocalCategoryDeals(categorySlug);

      try {
        const [remoteCategory, remoteDeals] = await Promise.all([
          fetchCategory(categorySlug),
          fetchCategoryDeals(categorySlug),
        ]);

        if (cancelled) return;
        setApiCategory(remoteCategory);
        setDeals(mergeDeals(remoteDeals, localDeals));
        setStatus("ready");
      } catch (error) {
        console.warn("Category API unavailable, using local deals", error);
        if (cancelled) return;
        setApiCategory(null);
        setDeals(localDeals);
        setStatus("error");
      }
    }

    loadCategoryDeals();
    window.addEventListener(DEAL_STORE_CHANGED, loadCategoryDeals);
    window.addEventListener("storage", loadCategoryDeals);

    return () => {
      cancelled = true;
      window.removeEventListener(DEAL_STORE_CHANGED, loadCategoryDeals);
      window.removeEventListener("storage", loadCategoryDeals);
    };
  }, [categorySlug]);

  const sortedDeals = useMemo(() => {
    return [...deals].sort((a, b) => {
      if (sortBy === "discount") return b.discountPercent - a.discountPercent;
      if (sortBy === "price_asc") return a.dealPrice - b.dealPrice;
      const promotedDiff = Number(b.isSponsored || b.isFeatured) - Number(a.isSponsored || a.isFeatured);
      if (promotedDiff !== 0) return promotedDiff;
      return b.quantitySold - a.quantitySold;
    });
  }, [deals, sortBy]);

  return (
    <div className={styles.page}>
      <section className={styles.hero} style={{ "--category-color": categoryColor } as React.CSSProperties}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <ArrowRight size={13} />
            <span>{categoryName}</span>
          </nav>

          <div className={styles.heroCard}>
            <div className={styles.iconShell}>
              <CategoryIcon size={30} strokeWidth={2.25} />
            </div>
            <div>
              <p className={styles.kicker}>Category deals</p>
              <h1 className={styles.title}>{categoryName}</h1>
              <p className={styles.subtitle}>
                {status === "loading"
                  ? "Loading the latest category deals..."
                  : `${sortedDeals.length} exact ${categoryName.toLowerCase()} deal${sortedDeals.length === 1 ? "" : "s"} available now.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.toolbar}>
            <div>
              <p className={styles.resultLabel}>Showing</p>
              <h2 className={styles.resultTitle}>{categoryName} deals</h2>
            </div>
            <div className={styles.sortGroup} aria-label="Sort deals">
              <button className={cn(styles.sortChip, sortBy === "popular" && styles.sortChipActive)} onClick={() => setSortBy("popular")} type="button">
                Popular
              </button>
              <button className={cn(styles.sortChip, sortBy === "discount" && styles.sortChipActive)} onClick={() => setSortBy("discount")} type="button">
                Biggest discount
              </button>
              <button className={cn(styles.sortChip, sortBy === "price_asc" && styles.sortChipActive)} onClick={() => setSortBy("price_asc")} type="button">
                Lowest price
              </button>
            </div>
          </div>

          {status === "loading" ? (
            <div className={styles.stateCard}>
              <Loader2 size={28} className={styles.spin} />
              <p>Fetching deals from <code>/api/deals?category={categorySlug}</code></p>
            </div>
          ) : sortedDeals.length > 0 ? (
            <div className="deal-grid">
              {sortedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className={styles.stateCard}>
              <Search size={40} className={styles.emptyIcon} />
              <h2>No {categoryName.toLowerCase()} deals found</h2>
              <p>This category is wired correctly, but there are no active deals with the slug <code>{categorySlug}</code>.</p>
              <Link href="/search" className={styles.browseLink}>Browse all deals</Link>
            </div>
          )}

          {status === "error" && sortedDeals.length > 0 && (
            <p className={styles.apiNote}>
              Backend API was unavailable, so this page is showing local approved/demo deals for this category.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

async function fetchCategory(slug: string): Promise<ApiCategory | null> {
  const response = await fetch(`${API_URL}/categories/${encodeURIComponent(slug)}`);
  if (!response.ok) return null;
  return response.json() as Promise<ApiCategory>;
}

async function fetchCategoryDeals(slug: string): Promise<Deal[]> {
  const response = await fetch(`${API_URL}/deals?category=${encodeURIComponent(slug)}&limit=50`);
  if (!response.ok) throw new Error(`Deals API failed with ${response.status}`);

  const payload = await response.json();
  const rawDeals: ApiDeal[] = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return rawDeals.map(normalizeApiDeal).filter((deal) => deal.category.slug === slug);
}

function getLocalCategoryDeals(slug: string) {
  return getMarketplaceDeals().filter((deal) => isCategoryMatch(deal, slug));
}

function isCategoryMatch(deal: Deal, slug: string) {
  return deal.category.slug === slug || deal.category.id === slug;
}

function mergeDeals(primary: Deal[], fallback: Deal[]) {
  const bySlug = new Map<string, Deal>();
  [...primary, ...fallback].forEach((deal) => bySlug.set(deal.slug, deal));
  return Array.from(bySlug.values());
}

function normalizeApiDeal(deal: ApiDeal): Deal {
  const category: Partial<Deal["category"]> = deal.category || {};
  const merchant: Partial<Deal["merchant"]> = deal.merchant || {};
  const isSponsored = Boolean(deal.isSponsored);

  return {
    id: String(deal.id || deal.slug || "api-deal"),
    slug: String(deal.slug || deal.id || "api-deal"),
    title: String(deal.title || "Untitled deal"),
    description: String(deal.description || ""),
    finePrint: typeof deal.finePrint === "string" ? deal.finePrint : undefined,
    highlights: parseStringList(deal.highlights),
    images: parseStringList(deal.images),
    originalPrice: toNumber(deal.originalPrice),
    dealPrice: toNumber(deal.dealPrice),
    discountPercent: toNumber(deal.discountPercent),
    extraDiscount: deal.extraDiscount === undefined || deal.extraDiscount === null ? undefined : toNumber(deal.extraDiscount),
    extraDiscountLabel: deal.extraDiscountLabel,
    quantityTotal: toNumber(deal.quantityTotal),
    quantitySold: toNumber(deal.quantitySold),
    maxPerUser: toNumber(deal.maxPerUser) || 1,
    startDate: String(deal.startDate || ""),
    endDate: String(deal.endDate || ""),
    status: normalizeStatus(deal.status),
    isFeatured: Boolean(deal.isFeatured),
    isSponsored,
    viewCount: toNumber(deal.viewCount),
    ratingAvg: toNumber(deal.ratingAvg),
    ratingCount: toNumber(deal.ratingCount),
    merchant: {
      id: String(merchant.id || "unknown"),
      businessName: String(merchant.businessName || "Unknown merchant"),
      logoUrl: merchant.logoUrl,
      address: String(merchant.address || ""),
      area: String(merchant.area || ""),
      city: String(merchant.city || ""),
      latitude: optionalNumber(merchant.latitude),
      longitude: optionalNumber(merchant.longitude),
      distanceKm: optionalNumber(merchant.distanceKm),
      isVerified: Boolean(merchant.isVerified),
      ratingAvg: toNumber(merchant.ratingAvg),
      ratingCount: toNumber(merchant.ratingCount),
      locationCount: merchant.locationCount,
    },
    category: {
      id: String(category.id || category.slug || "uncategorized"),
      name: String(category.name || "Uncategorized"),
      slug: String(category.slug || category.id || "uncategorized"),
    },
    options: parseOptions(deal.options),
    badges: parseBadges(deal.badges, isSponsored),
  };
}

function parseStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

function parseOptions(value: unknown): Deal["options"] {
  const rawOptions = Array.isArray(value) ? value : [];
  return rawOptions.map((option, index) => {
    const item = option as Record<string, unknown>;
    return {
      id: String(item.id || `option-${index}`),
      title: String(item.title || "Deal option"),
      originalPrice: toNumber(item.originalPrice),
      dealPrice: toNumber(item.dealPrice),
      boughtCount: toNumber(item.boughtCount),
    };
  });
}

function parseBadges(value: unknown, isSponsored: boolean): DealBadge[] {
  if (Array.isArray(value)) return value.filter(isDealBadge);
  return isSponsored ? ["sponsored", "verified"] : ["verified"];
}

function isDealBadge(value: unknown): value is DealBadge {
  return ["popular", "sponsored", "limited", "verified", "new", "gift", "bookable"].includes(String(value));
}

function normalizeStatus(status: unknown): Deal["status"] {
  const normalized = String(status || "active").toLowerCase();
  if (["active", "paused", "expired", "sold_out", "draft"].includes(normalized)) return normalized as Deal["status"];
  return "active";
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function optionalNumber(value: unknown): number | undefined {
  const numberValue = toNumber(value);
  return numberValue === 0 && (value === undefined || value === null || value === "") ? undefined : numberValue;
}

function toTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

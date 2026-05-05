import { DEMO_DEALS } from "@/lib/demo-data";
import { API_URL, calcDiscount, slugify } from "@/lib/utils";
import type { Deal, DealBadge } from "@/types";

export type DealReviewStatus = "pending_review" | "approved" | "changes_requested";

export type ManagedDeal = Deal & {
  reviewStatus: DealReviewStatus;
  submittedAt: string;
  submittedBy: string;
  adminNote?: string;
};

export type RegisteredMerchant = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  area: string;
  city: string;
  payoutMethod: string;
  password?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: string;
};

export type DealOptionInput = {
  title: string;
  originalPrice: number;
  dealPrice: number;
};

export type NewDealInput = {
  title: string;
  categoryName: string;
  categorySlug: string;
  categoryId?: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  quantityTotal: number;
  maxPerUser: number;
  redemptionMethod: string;
  validity: string;
  highlights?: string[];
  finePrint?: string[];
  options?: DealOptionInput[];
  startDate?: string;
  endDate?: string;
  image?: string;
  gallery?: string[];
  merchant?: {
    id: string;
    businessName: string;
    address: string;
    area: string;
    city: string;
  };
};

type ApiDeal = Partial<Omit<Deal, "status" | "highlights" | "images" | "options" | "badges">> & {
  status?: string;
  highlights?: unknown;
  images?: unknown;
  options?: unknown;
  badges?: unknown;
};

const DEALS_KEY = "couponus_merchant_created_deals";
const MERCHANTS_KEY = "couponus_registered_merchants";
export const DEAL_STORE_CHANGED = "couponus-deals-changed";

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(DEAL_STORE_CHANGED));
}

export function getManagedDeals(): ManagedDeal[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(DEALS_KEY) || "[]") as ManagedDeal[];
  } catch {
    return [];
  }
}

export function saveManagedDeals(deals: ManagedDeal[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
  emitChange();
}

export function getMarketplaceDeals(): Deal[] {
  return [
    ...getManagedDeals()
      .filter((deal) => deal?.status === "active" && deal?.reviewStatus === "approved")
      .map(normalizeMarketplaceDeal),
    ...DEMO_DEALS,
  ];
}

export async function fetchMarketplaceDeals({
  category,
  limit = 50,
  timeoutMs = 4500,
}: {
  category?: string;
  limit?: number;
  timeoutMs?: number;
} = {}): Promise<Deal[]> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (category) params.set("category", category);

    const response = await fetch(`${API_URL}/deals?${params.toString()}`, {
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Deals API failed with ${response.status}`);

    const payload = await response.json();
    const rawDeals: ApiDeal[] = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return rawDeals.map(normalizeApiDeal);
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getLiveMarketplaceDeals(options: { category?: string; limit?: number; timeoutMs?: number } = {}) {
  try {
    const apiDeals = await fetchMarketplaceDeals(options);
    if (apiDeals.length > 0) return mergeDeals(apiDeals, getMarketplaceDeals());
  } catch {
    // API unavailable on LAN/offline/dev startup: keep storefront populated.
  }

  return getMarketplaceDeals();
}

export function mergeDeals(primary: Deal[], fallback: Deal[]) {
  const bySlug = new Map<string, Deal>();
  [...primary, ...fallback].forEach((deal) => bySlug.set(deal.slug, deal));
  return Array.from(bySlug.values());
}

function normalizeMarketplaceDeal(deal: ManagedDeal): Deal {
  const title = deal.title || "Untitled deal";
  const merchant = deal.merchant || ({} as Deal["merchant"]);
  const category = deal.category || ({} as Deal["category"]);

  return {
    ...deal,
    id: deal.id || `stored-${slugify(title)}`,
    slug: deal.slug || slugify(title),
    title,
    description: deal.description || "",
    finePrint: deal.finePrint || "",
    highlights: Array.isArray(deal.highlights) ? deal.highlights : [],
    images: Array.isArray(deal.images) ? deal.images : [],
    originalPrice: Number(deal.originalPrice) || 0,
    dealPrice: Number(deal.dealPrice) || 0,
    discountPercent: Number(deal.discountPercent) || 0,
    quantityTotal: Number(deal.quantityTotal) || 0,
    quantitySold: Number(deal.quantitySold) || 0,
    maxPerUser: Number(deal.maxPerUser) || 1,
    startDate: deal.startDate || "",
    endDate: deal.endDate || "",
    status: deal.status || "active",
    isFeatured: Boolean(deal.isFeatured),
    isSponsored: Boolean(deal.isSponsored),
    viewCount: Number(deal.viewCount) || 0,
    ratingAvg: Number(deal.ratingAvg) || 0,
    ratingCount: Number(deal.ratingCount) || 0,
    merchant: {
      ...merchant,
      id: merchant.id || "unknown-merchant",
      businessName: merchant.businessName || "Unknown merchant",
      address: merchant.address || "",
      area: merchant.area || "",
      city: merchant.city || "",
      isVerified: Boolean(merchant.isVerified),
      ratingAvg: Number(merchant.ratingAvg) || 0,
      ratingCount: Number(merchant.ratingCount) || 0,
    },
    category: {
      ...category,
      id: category.id || "uncategorized",
      name: category.name || "Uncategorized",
      slug: category.slug || "uncategorized",
    },
    options: Array.isArray(deal.options) ? deal.options : [],
    badges: Array.isArray(deal.badges) ? deal.badges : [],
  };
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

export function createManagedDeal(input: NewDealInput): ManagedDeal {
  const id = `merchant-${Date.now()}`;
  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const image = input.image || "/images/deals/spa-1.jpg";
  const merchant = input.merchant || {
    id: "demo-merchant-serenity-spa",
    businessName: "Serenity Thai Spa",
    address: "House 45, Road 12",
    area: "Gulshan 1",
    city: "Dhaka",
  };

  const defaultStart = new Date().toISOString().slice(0, 10);
  const defaultEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);

  // Build highlights — use merchant-provided or fall back to sensible defaults
  const highlights = input.highlights && input.highlights.length > 0
    ? input.highlights
    : [input.categoryName, input.redemptionMethod, input.validity];

  // Build fine print — use merchant-provided or generate generic
  const finePrintItems = input.finePrint && input.finePrint.length > 0
    ? input.finePrint
    : [];
  const finePrint = finePrintItems.length > 0
    ? finePrintItems.join(". ") + "."
    : `${input.redemptionMethod}. ${input.validity}. Subject to merchant availability and COUPONUS BD approval policies.`;

  // Build options — use merchant-provided tiers or single default
  const options = input.options && input.options.length > 0
    ? input.options.map((opt, i) => ({
        id: `${id}-option-${i}`,
        title: opt.title,
        originalPrice: opt.originalPrice,
        dealPrice: opt.dealPrice,
        boughtCount: 0,
      }))
    : [
        {
          id: `${id}-option`,
          title: input.title,
          originalPrice: input.originalPrice,
          dealPrice: input.dealPrice,
          boughtCount: 0,
        },
      ];

  // Use the lowest dealPrice from options as the headline price
  const lowestDealPrice = options.reduce((min, o) => Math.min(min, o.dealPrice), options[0].dealPrice);
  const highestOriginalPrice = options.reduce((max, o) => Math.max(max, o.originalPrice), options[0].originalPrice);

  return {
    id,
    slug,
    title: input.title,
    description: input.description,
    finePrint,
    highlights,
    images: [image, ...(input.gallery || [])],
    originalPrice: highestOriginalPrice,
    dealPrice: lowestDealPrice,
    discountPercent: calcDiscount(highestOriginalPrice, lowestDealPrice),
    quantityTotal: input.quantityTotal,
    quantitySold: 0,
    maxPerUser: input.maxPerUser,
    startDate: input.startDate || defaultStart,
    endDate: input.endDate || defaultEnd,
    status: "draft",
    isFeatured: true,
    isSponsored: false,
    viewCount: 0,
    ratingAvg: 0,
    ratingCount: 0,
    merchant: {
      ...merchant,
      isVerified: true,
      ratingAvg: 4.8,
      ratingCount: 2341,
    },
    category: {
      id: input.categoryId || input.categorySlug,
      name: input.categoryName,
      slug: input.categorySlug,
    },
    options,
    badges: ["new", "verified"],
    reviewStatus: "pending_review",
    submittedAt: new Date().toISOString(),
    submittedBy: merchant.businessName,
  };
}

export function addManagedDeal(input: NewDealInput) {
  const deal = createManagedDeal(input);
  saveManagedDeals([deal, ...getManagedDeals()]);
  return deal;
}

export function updateManagedDeal(id: string, changes: Partial<ManagedDeal>) {
  const deals = getManagedDeals().map((deal) => (deal.id === id ? { ...deal, ...changes } : deal));
  saveManagedDeals(deals);
}

export function deleteManagedDeal(id: string) {
  saveManagedDeals(getManagedDeals().filter((deal) => deal.id !== id));
}

export function getRegisteredMerchants(): RegisteredMerchant[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem(MERCHANTS_KEY) || "[]") as RegisteredMerchant[];
  } catch {
    return [];
  }
}

export function saveRegisteredMerchants(merchants: RegisteredMerchant[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(MERCHANTS_KEY, JSON.stringify(merchants));
  emitChange();
}

export function addRegisteredMerchant(merchant: Omit<RegisteredMerchant, "id" | "verificationStatus" | "createdAt">) {
  const registeredMerchant: RegisteredMerchant = {
    ...merchant,
    id: `merchant-${Date.now()}`,
    verificationStatus: "pending",
    createdAt: new Date().toISOString(),
  };
  saveRegisteredMerchants([registeredMerchant, ...getRegisteredMerchants()]);
  return registeredMerchant;
}

export function updateRegisteredMerchant(id: string, changes: Partial<RegisteredMerchant>) {
  const merchants = getRegisteredMerchants().map((m) => (m.id === id ? { ...m, ...changes } : m));
  saveRegisteredMerchants(merchants);
}

export function deleteRegisteredMerchant(id: string) {
  saveRegisteredMerchants(getRegisteredMerchants().filter((m) => m.id !== id));
}

export async function loginMerchant(email: string, password?: string) {
  if (!canUseStorage()) return null;

  // 1. Try real backend API login first
  try {
    const API_URL =
      typeof window !== "undefined"
        ? `http://${window.location.hostname}:4000/api`
        : "http://localhost:4000/api";

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user && data.user.role === "MERCHANT") {
        const userSession = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
        };
        localStorage.setItem("couponus_user", JSON.stringify(userSession));
        localStorage.setItem("couponus_token", data.accessToken);
        localStorage.setItem("couponus_access_token", data.accessToken);
        localStorage.setItem("couponus_refresh_token", data.refreshToken);
        return userSession;
      }
    }
  } catch {
    // Backend unavailable — fall through to localStorage
  }

  // 2. Fallback: check locally registered merchants (demo mode)
  const merchants = getRegisteredMerchants();
  const merchant = merchants.find(m => m.email === email && (!m.password || m.password === password));
  if (merchant) {
    localStorage.removeItem("couponus_token");
    localStorage.removeItem("couponus_refresh_token");
    const userSession = {
      id: merchant.id,
      email: merchant.email,
      fullName: merchant.ownerName,
      role: "MERCHANT",
    };
    localStorage.setItem("couponus_user", JSON.stringify(userSession));
    localStorage.setItem("couponus_access_token", "demo-merchant-token-hardcoded");
    return userSession;
  }
  return null;
}

export function logoutMerchant() {
  if (!canUseStorage()) return;
  localStorage.removeItem("couponus_user");
  localStorage.removeItem("couponus_token");
  localStorage.removeItem("couponus_access_token");
  localStorage.removeItem("couponus_refresh_token");
}

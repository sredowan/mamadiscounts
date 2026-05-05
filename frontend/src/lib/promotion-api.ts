/**
 * Promotions API Client
 * Replaces localStorage-based promotion-store with real backend calls.
 */
import { API_URL } from "./utils";

// ── Types (matching backend Prisma enums) ──────────────
export type PromotionPlacement = "MAIN_BANNER" | "SPONSORED_VOUCHER";
export type PromotionSlotTier = "LATE_NIGHT" | "MORNING" | "AFTERNOON" | "PRIME";
export type PromotionStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type PromotionPaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type PromotionLinkType = "SHOP" | "DEAL" | "CUSTOM";

export interface Promotion {
  id: string;
  merchantId: string;
  placement: PromotionPlacement;
  title: string;
  imageUrl: string | null;
  linkType: PromotionLinkType;
  linkHref: string;
  slotDate: string;
  slotTier: PromotionSlotTier;
  price: number;
  templateStyleKey?: string | null;
  templateHeadline?: string | null;
  templateSubtext?: string | null;
  templateDiscountText?: string | null;
  templateShopLogo?: string | null;
  templateProductImage?: string | null;
  status: PromotionStatus;
  paymentStatus: PromotionPaymentStatus;
  adminNote?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  merchant?: { id: string; businessName: string; logoUrl?: string | null; phone?: string | null };
  extensions?: Array<{ id: string; slotDate: string; slotTier: PromotionSlotTier; status: PromotionStatus; price: number }>;
}

export interface SlotAvailability {
  tier: PromotionSlotTier;
  label: string;
  booked: number;
  capacity: number;
  available: number;
  price: number;
}

// ── Slot definitions (client-side reference) ───────────
export const SLOT_TIERS: Record<PromotionSlotTier, { label: string; startHour: number; endHour: number }> = {
  LATE_NIGHT: { label: "Late Night (1 AM – 9 AM)", startHour: 1, endHour: 9 },
  MORNING:    { label: "Morning (9 AM – 12 PM)",   startHour: 9, endHour: 12 },
  AFTERNOON:  { label: "Afternoon (1 PM – 5 PM)",  startHour: 13, endHour: 17 },
  PRIME:      { label: "Prime Time (6 PM – 12 AM)", startHour: 18, endHour: 24 },
};

export const SLOT_PRICES: Record<PromotionSlotTier, Record<PromotionPlacement, number>> = {
  LATE_NIGHT: { MAIN_BANNER: 500, SPONSORED_VOUCHER: 100 },
  MORNING:    { MAIN_BANNER: 1000, SPONSORED_VOUCHER: 500 },
  AFTERNOON:  { MAIN_BANNER: 2000, SPONSORED_VOUCHER: 500 },
  PRIME:      { MAIN_BANNER: 4000, SPONSORED_VOUCHER: 2500 },
};

export const SLOT_CAPACITY: Record<PromotionPlacement, number> = {
  MAIN_BANNER: 5,
  SPONSORED_VOUCHER: 4,
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("couponus_access_token") || localStorage.getItem("couponus_token");
  } catch { return null; }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("couponus_refresh_token");
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem("couponus_access_token", data.accessToken);
  localStorage.setItem("couponus_refresh_token", data.refreshToken);
  localStorage.setItem("couponus_user", JSON.stringify(data.user));
  return true;
}

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && retry && await refreshAccessToken()) {
    return authFetch(input, init, false);
  }

  return res;
}

// ── Public API ─────────────────────────────────────────

/** Get promotions currently live for a placement */
export async function getLivePromotions(placement: PromotionPlacement): Promise<Promotion[]> {
  const res = await fetch(`${API_URL}/promotions/live?placement=${placement}`);
  if (!res.ok) throw new Error("Failed to fetch live promotions");
  return res.json();
}

/** Check slot availability for a date + placement */
export async function getSlotAvailability(date: string, placement: PromotionPlacement): Promise<SlotAvailability[]> {
  const res = await fetch(`${API_URL}/promotions/availability?date=${date}&placement=${placement}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.slots || [];
}

// ── Merchant API ───────────────────────────────────────

/** Get merchant's own promotions */
export async function getMyPromotions(): Promise<Promotion[]> {
  const res = await authFetch(`${API_URL}/promotions/mine`);
  if (!res.ok) return [];
  return res.json();
}

/** Create a new promotion */
export async function createPromotion(data: {
  placement: PromotionPlacement;
  title: string;
  imageUrl?: string;
  linkType: PromotionLinkType;
  linkHref: string;
  slotDate: string;
  slotTier?: PromotionSlotTier;
  slotTiers?: PromotionSlotTier[];
  templateStyleKey?: string;
  templateHeadline?: string;
  templateSubtext?: string;
  templateDiscountText?: string;
  templateShopLogo?: string;
  templateProductImage?: string;
}): Promise<{ promotion?: Promotion; promotions?: Promotion[]; totalPrice?: number; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to create promotion" };
  if (Array.isArray(json.promotions)) {
    return { promotion: json.promotion, promotions: json.promotions, totalPrice: json.totalPrice };
  }
  return { promotion: json, promotions: [json], totalPrice: Number(json.price) };
}

/** Update an existing promotion */
export async function updatePromotion(id: string, data: {
  title?: string;
  imageUrl?: string;
  linkType?: PromotionLinkType;
  linkHref?: string;
  slotDate?: string;
  slotTier?: PromotionSlotTier;
  templateStyleKey?: string | null;
  templateHeadline?: string | null;
  templateSubtext?: string | null;
  templateDiscountText?: string | null;
  templateShopLogo?: string | null;
  templateProductImage?: string | null;
}): Promise<{ promotion?: Promotion; priceDiff?: number; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to update promotion" };
  return { promotion: json.promotion, priceDiff: json.priceDiff };
}

/** Extend a promotion with additional days */
export async function extendPromotion(id: string, extensions: Array<{
  slotDate: string;
  slotTier: PromotionSlotTier;
}>): Promise<{ extensions?: Promotion[]; totalPrice?: number; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/${id}/extend`, {
    method: "POST",
    body: JSON.stringify({ extensions }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to extend promotion" };
  return { extensions: json.extensions, totalPrice: json.totalPrice };
}

/** Delete/cancel a promotion */
export async function deletePromotion(id: string): Promise<{ success?: boolean; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to delete promotion" };
  return { success: true };
}

// ── Admin API ──────────────────────────────────────────

/** Admin: List all promotions */
export async function adminGetPromotions(filters?: {
  status?: string;
  placement?: string;
  date?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Promotion[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.placement) params.set("placement", filters.placement);
  if (filters?.date) params.set("date", filters.date);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const res = await authFetch(`${API_URL}/promotions/admin/all?${params}`);
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Failed to fetch promotions");
  }
  return res.json();
}

/** Admin: Edit any promotion */
export async function adminUpdatePromotion(id: string, data: Record<string, unknown>): Promise<{ promotion?: Promotion; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to update promotion" };
  return { promotion: json };
}

/** Admin: Approve a promotion */
export async function adminApprovePromotion(id: string, adminNote?: string): Promise<{ promotion?: Promotion; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/admin/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({ adminNote }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to approve promotion" };
  return { promotion: json };
}

/** Admin: Reject a promotion */
export async function adminRejectPromotion(id: string, reason?: string): Promise<{ promotion?: Promotion; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/admin/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ adminNote: reason }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to reject promotion" };
  return { promotion: json };
}

/** Admin: Verify/reject payment */
export async function adminUpdatePayment(id: string, paymentStatus: "VERIFIED" | "REJECTED"): Promise<{ promotion?: Promotion; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/admin/${id}/payment`, {
    method: "PUT",
    body: JSON.stringify({ paymentStatus }),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to update payment" };
  return { promotion: json };
}

/** Admin: Delete a promotion */
export async function adminDeletePromotion(id: string): Promise<{ success?: boolean; error?: string }> {
  const res = await authFetch(`${API_URL}/promotions/admin/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || "Failed to delete promotion" };
  return { success: true };
}

function getDhakaDateHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    hour: parseInt(get("hour"), 10),
  };
}

function getCurrentPromotionSlot() {
  const { dateStr, hour } = getDhakaDateHour();

  if (hour === 0) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return { dateStr: getDhakaDateHour(yesterday).dateStr, hour, tier: "PRIME" as PromotionSlotTier };
  }
  if (hour >= 1 && hour < 9) return { dateStr, hour, tier: "LATE_NIGHT" as PromotionSlotTier };
  if (hour >= 9 && hour < 12) return { dateStr, hour, tier: "MORNING" as PromotionSlotTier };
  if (hour >= 13 && hour < 17) return { dateStr, hour, tier: "AFTERNOON" as PromotionSlotTier };
  if (hour >= 18) return { dateStr, hour, tier: "PRIME" as PromotionSlotTier };
  return { dateStr, hour, tier: null };
}

// ── Status Label Helper ────────────────────────────────
export function getPromotionStatusLabel(promo: Promotion): string {
  if (promo.status === "REJECTED") return "Rejected";
  if (promo.paymentStatus === "REJECTED") return "Payment rejected";
  if (promo.paymentStatus !== "VERIFIED") return "Payment pending";
  if (promo.status !== "APPROVED") return "Pending review";

  const current = getCurrentPromotionSlot();
  const promoDate = promo.slotDate.split("T")[0];

  if (promoDate < current.dateStr) return "Expired";
  if (promoDate > current.dateStr) return "Scheduled";
  if (current.tier === promo.slotTier) return "Live";

  const slot = SLOT_TIERS[promo.slotTier];
  if (promo.slotTier === "PRIME") return current.hour < slot.startHour ? "Scheduled" : "Expired";
  return current.hour >= slot.endHour ? "Expired" : "Scheduled";
}

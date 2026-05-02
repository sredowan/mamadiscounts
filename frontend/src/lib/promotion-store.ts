export type PromotionPlacement = "main_banner" | "sponsored_voucher";
export type PromotionStatus = "pending_review" | "approved" | "rejected";
export type PromotionPaymentStatus = "pending" | "verified" | "rejected";
export type PromotionLinkType = "shop" | "deal" | "custom";
export type TimeSlotTier = "morning" | "afternoon" | "prime" | "late_night";

export interface SlotDefinition {
  id: TimeSlotTier;
  label: string;
  startHour: number;
  endHour: number;
  prices: {
    main_banner: number;
    sponsored_voucher: number;
  };
}

export type MerchantPromotion = {
  id: string;
  merchantId: string;
  merchantName: string;
  placement: PromotionPlacement;
  title: string;
  imageUrl: string;
  linkType: PromotionLinkType;
  linkHref: string;
  price: number;
  slotDate: string; // YYYY-MM-DD
  slotTiers: TimeSlotTier[]; // Allow booking multiple tiers on the same date
  status: PromotionStatus;
  paymentStatus: PromotionPaymentStatus;
  adminNote?: string;
  createdAt: string;
  approvedAt?: string;
  templateStyleKey?: string;
  templateHeadline?: string;
  templateSubtext?: string;
  templateDiscountText?: string;
  templateShopLogo?: string;
  templateProductImage?: string;
};

export type PromotionInput = Omit<MerchantPromotion, "id" | "price" | "status" | "paymentStatus" | "createdAt" | "approvedAt">;

const PROMOTIONS_KEY = "couponus_merchant_promotions";
export const PROMOTION_STORE_CHANGED = "couponus-promotions-changed";

export const SLOT_CAPACITY = {
  main_banner: 5,
  sponsored_voucher: 3,
};

export const TIME_SLOT_TIERS: Record<TimeSlotTier, SlotDefinition> = {
  morning: {
    id: "morning",
    label: "Morning (9 AM - 12 PM)",
    startHour: 9,
    endHour: 12,
    prices: { main_banner: 1000, sponsored_voucher: 500 },
  },
  afternoon: {
    id: "afternoon",
    label: "Afternoon (1 PM - 5 PM)",
    startHour: 13,
    endHour: 17,
    prices: { main_banner: 2000, sponsored_voucher: 500 },
  },
  prime: {
    id: "prime",
    label: "Prime Time (6 PM - 12 AM)",
    startHour: 18,
    endHour: 24, // Handled properly in logic
    prices: { main_banner: 4000, sponsored_voucher: 2500 },
  },
  late_night: {
    id: "late_night",
    label: "Late Night (1 AM - 9 AM)",
    startHour: 1,
    endHour: 9,
    prices: { main_banner: 500, sponsored_voucher: 100 },
  },
};

export function getSlotPrice(tier: TimeSlotTier, placement: PromotionPlacement) {
  return TIME_SLOT_TIERS[tier].prices[placement];
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(PROMOTION_STORE_CHANGED));
}

export function getPromotions(): MerchantPromotion[] {
  if (!canUseStorage()) return [];
  try {
    const data = JSON.parse(localStorage.getItem(PROMOTIONS_KEY) || "[]");
    return data.map((promo: any) => {
      // Migration for old data that used 'slots' array
      let slotTiers = promo.slotTiers;
      let slotDate = promo.slotDate;
      
      if (!slotTiers) {
        slotTiers = promo.slots ? promo.slots.map((s: any) => s.slotId) : [];
      }
      if (!slotDate) {
        slotDate = promo.slots && promo.slots.length > 0 ? promo.slots[0].date : "";
      }
      
      return {
        ...promo,
        slotTiers,
        slotDate,
      };
    });
  } catch {
    return [];
  }
}

export function savePromotions(promotions: MerchantPromotion[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
  emitChange();
}

export function addPromotion(input: PromotionInput) {
  // Calculate total price based on selected tiers
  const totalPrice = input.slotTiers.reduce((sum, tier) => sum + getSlotPrice(tier, input.placement), 0);

  const promotion: MerchantPromotion = {
    ...input,
    id: `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    price: totalPrice,
    status: "pending_review",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  savePromotions([promotion, ...getPromotions()]);
  return promotion;
}

export function updatePromotion(id: string, changes: Partial<MerchantPromotion>) {
  const promotions = getPromotions().map((promotion) => (
    promotion.id === id ? { ...promotion, ...changes } : promotion
  ));
  savePromotions(promotions);
}

export function deletePromotion(id: string) {
  savePromotions(getPromotions().filter((promotion) => promotion.id !== id));
}

export function nowInBangladeshKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = parseInt(get("hour"), 10);
  
  return { dateStr, hour };
}

export function getCurrentSlotTier(hour: number): TimeSlotTier | null {
  for (const tier of Object.values(TIME_SLOT_TIERS)) {
    if (tier.id === "prime") {
      if (hour >= 18 || hour === 0) return tier.id; // Prime is 6 PM to midnight (00:00 is technically next day, but for ease of logic we consider 0 as prime)
    } else {
      if (hour >= tier.startHour && hour < tier.endHour) return tier.id;
    }
  }
  return null;
}

function isSlotReservedByPromotion(promotion: MerchantPromotion) {
  return promotion.status !== "rejected" && promotion.paymentStatus !== "rejected";
}

export function getBookedSlotCount(placement: PromotionPlacement, date: string, tier: TimeSlotTier, excludeId?: string) {
  return getPromotions().filter((promotion) => (
    promotion.id !== excludeId
    && promotion.placement === placement
    && isSlotReservedByPromotion(promotion)
    && promotion.slotDate === date
    && promotion.slotTiers.includes(tier)
  )).length;
}

export function isSlotAvailable(placement: PromotionPlacement, date: string, tier: TimeSlotTier, excludeId?: string) {
  return getBookedSlotCount(placement, date, tier, excludeId) < SLOT_CAPACITY[placement];
}

export function canApprovePromotion(promotion: MerchantPromotion) {
  return promotion.slotTiers.every((tier) => (
    getBookedSlotCount(promotion.placement, promotion.slotDate, tier, promotion.id) < SLOT_CAPACITY[promotion.placement]
  ));
}

function seededRandom(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return () => {
    hash += 0x6D2B79F5;
    let t = hash;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableShuffle<T>(items: T[], seed: string) {
  const random = seededRandom(seed);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getVisiblePromotions(placement: PromotionPlacement) {
  const limit = SLOT_CAPACITY[placement];
  const { dateStr, hour } = nowInBangladeshKey();
  
  // If we are at hour 0, the active prime slot technically belongs to "yesterday"
  // Let's adjust date if hour is 0
  let effectiveDate = dateStr;
  if (hour === 0) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    effectiveDate = d.toISOString().split('T')[0];
  }

  const currentTier = getCurrentSlotTier(hour);
  if (!currentTier) return [];

  const visible = getPromotions().filter((promotion) => (
    promotion.placement === placement
    && promotion.status === "approved"
    && promotion.paymentStatus === "verified"
    && promotion.slotDate === effectiveDate
    && promotion.slotTiers.includes(currentTier)
  ));

  return stableShuffle(visible, `${effectiveDate}:${currentTier}:${placement}`).slice(0, limit);
}

export function getPromotionStatusLabel(promotion: MerchantPromotion) {
  if (promotion.status === "rejected") return "Rejected";
  if (promotion.paymentStatus === "rejected") return "Payment rejected";
  if (promotion.paymentStatus !== "verified") return "Payment pending";
  if (promotion.status !== "approved") return "Pending review";
  
  const { dateStr, hour } = nowInBangladeshKey();
  
  if (promotion.slotDate < dateStr) return "Expired";
  if (promotion.slotDate > dateStr) return "Scheduled";
  
  const currentTier = getCurrentSlotTier(hour);
  if (currentTier && promotion.slotTiers.includes(currentTier)) return "Live";
  
  // Check if we are past the last booked slot
  const lastBookedTier = [...promotion.slotTiers].sort((a, b) => TIME_SLOT_TIERS[b].startHour - TIME_SLOT_TIERS[a].startHour)[0];
  const endHour = TIME_SLOT_TIERS[lastBookedTier].endHour;
  
  if (hour >= endHour && endHour !== 24) return "Expired";
  return "Scheduled";
}

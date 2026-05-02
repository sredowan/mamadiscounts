import type { CartItem, Deal, DealOption } from "@/types";

const CHECKOUT_CART_KEY = "couponus_checkout_cart";
const CHECKOUT_GIFT_KEY = "couponus_checkout_buy_as_gift";

export function createCartItemFromDeal(deal: Deal, option: DealOption | undefined, quantity: number): CartItem {
  const selectedOption = option || deal.options[0];

  return {
    dealId: deal.id,
    optionId: selectedOption?.id || `${deal.id}-option`,
    optionTitle: selectedOption?.title || deal.title,
    quantity: Math.max(1, Math.min(deal.maxPerUser || 5, quantity)),
    unitPrice: selectedOption?.dealPrice || deal.dealPrice,
    originalPrice: selectedOption?.originalPrice || deal.originalPrice,
    dealTitle: deal.title,
    merchantName: deal.merchant.businessName,
    imageUrl: deal.images[0] || "/placeholder-deal.jpg",
  };
}

export function saveCheckoutCart(items: CartItem[], buyAsGift: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(items));
  window.localStorage.setItem(CHECKOUT_GIFT_KEY, buyAsGift ? "true" : "false");
}

export function getCheckoutCart(fallback: CartItem[]): CartItem[] {
  if (typeof window === "undefined") return fallback;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CHECKOUT_CART_KEY) || "null") as CartItem[] | null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getCheckoutBuyAsGift() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CHECKOUT_GIFT_KEY) === "true";
}

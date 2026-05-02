export interface Deal {
  id: string;
  slug: string;
  title: string;
  description: string;
  finePrint?: string;
  highlights: string[];
  images: string[];
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  extraDiscount?: number;
  extraDiscountLabel?: string;
  quantityTotal: number;
  quantitySold: number;
  maxPerUser: number;
  startDate: string;
  endDate: string;
  status: "active" | "paused" | "expired" | "sold_out" | "draft";
  isFeatured: boolean;
  isSponsored: boolean;
  viewCount: number;
  ratingAvg: number;
  ratingCount: number;
  merchant: MerchantSummary;
  category: CategorySummary;
  options: DealOption[];
  badges: DealBadge[];
}

export interface DealOption {
  id: string;
  title: string;
  originalPrice: number;
  dealPrice: number;
  boughtCount: number;
}

export type DealBadge = "popular" | "sponsored" | "limited" | "verified" | "new" | "gift" | "bookable";

export interface MerchantSummary {
  id: string;
  businessName: string;
  logoUrl?: string;
  address: string;
  area: string;
  city: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  locationCount?: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  userName: string;
  avatarUrl?: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: "customer" | "merchant" | "admin";
}

export interface Voucher {
  id: string;
  voucherCode: string;
  qrData: string;
  otp: string;
  refId: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  status: "active" | "redeemed" | "expired" | "refunded";
  dealId: string;
  dealTitle: string;
  optionTitle: string;
  merchantId: string;
  merchantName: string;
  purchaseDate: string;
  expiryDate: string;
  redeemedAt?: string;
  redeemedBy?: string;
  redemptionMethod?: "qr" | "otp" | "refid" | "phone";
}

export interface CartItem {
  dealId: string;
  optionId: string;
  optionTitle: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  dealTitle: string;
  merchantName: string;
  imageUrl: string;
}

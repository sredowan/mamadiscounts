import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users, Award, Gift, Zap } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { formatCount, formatDistance } from "@/lib/utils";
import type { Deal, DealBadge } from "@/types";
import styles from "./DealCard.module.css";

interface DealCardProps {
  deal: Deal;
}

const BADGE_CONFIG: Record<DealBadge, { label: string; icon: React.ElementType; className: string }> = {
  popular: { label: "Popular", icon: Zap, className: "badge-popular" },
  sponsored: { label: "Sponsored", icon: Award, className: "badge-sponsored" },
  limited: { label: "Limited Time", icon: Clock, className: "badge-limited" },
  verified: { label: "Verified", icon: Award, className: "badge-verified" },
  new: { label: "New", icon: Zap, className: "badge-new" },
  gift: { label: "Great Gift", icon: Gift, className: "badge-popular" },
  bookable: { label: "Book Online", icon: Zap, className: "badge-verified" },
};

export function DealCard({ deal }: DealCardProps) {
  const primaryBadge = deal.badges[0];
  const badgeInfo = primaryBadge ? BADGE_CONFIG[primaryBadge] : null;
  const imageSrc = deal.images[0] || "/placeholder-deal.jpg";

  return (
    <Link href={`/deals/${deal.slug}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {imageSrc.startsWith("data:") ? (
          <img src={imageSrc} alt={deal.title} className={styles.image} />
        ) : (
          <Image
            src={imageSrc}
            alt={deal.title}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className={styles.image}
          />
        )}
        {badgeInfo && (
          <span className={`badge ${badgeInfo.className} ${styles.badge}`}>
            <badgeInfo.icon size={12} />
            {badgeInfo.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Merchant */}
        <div className={styles.merchant}>
          <span className={styles.merchantName}>{deal.merchant.businessName}</span>
          {deal.merchant.locationCount && deal.merchant.locationCount > 1 && (
            <span className={styles.locationCount}>
              ({deal.merchant.locationCount} locations)
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={styles.title}>{deal.title}</h3>

        {/* Location & Distance */}
        <div className={styles.meta}>
          <MapPin size={13} />
          <span>
            {deal.merchant.area}, {deal.merchant.city}
          </span>
          {deal.merchant.distanceKm !== undefined && (
            <span className={styles.distance}>
              {formatDistance(deal.merchant.distanceKm)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className={styles.ratingRow}>
          <StarRating
            rating={deal.ratingAvg}
            count={deal.ratingCount}
            size={13}
          />
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <PriceDisplay
            originalPrice={deal.originalPrice}
            dealPrice={deal.dealPrice}
            extraDiscount={deal.extraDiscount}
            extraLabel={deal.extraDiscountLabel}
            size="md"
          />
        </div>

        {/* Social proof */}
        {deal.quantitySold > 0 && (
          <div className={styles.sold}>
            <Users size={12} />
            <span>{formatCount(deal.quantitySold)} bought</span>
          </div>
        )}
      </div>
    </Link>
  );
}

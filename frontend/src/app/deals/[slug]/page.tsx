"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Users, Shield, ChevronRight, ChevronLeft,
  Heart, Share2, Gift, Minus, Plus, CheckCircle2,
  AlertCircle, CreditCard, ArrowRight, Phone, Navigation,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DealCard } from "@/components/deals/DealCard";
import { formatBDT, formatCount, cn, formatDistance } from "@/lib/utils";
import { DEMO_DEALS } from "@/lib/demo-data";
import { DEAL_STORE_CHANGED, getMarketplaceDeals } from "@/lib/deal-store";
import { createCartItemFromDeal, saveCheckoutCart } from "@/lib/checkout-cart";
import type { Deal } from "@/types";
import styles from "./page.module.css";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [deals, setDeals] = useState<Deal[]>(DEMO_DEALS);
  const deal = deals.find((d) => d.slug === slug) || deals[0] || DEMO_DEALS[0];

  const [selectedOptionId, setSelectedOptionId] = useState(deal.options[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "fineprint" | "reviews">("description");
  const [currentImage, setCurrentImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const currentImageSrc = deal.images[currentImage] || "/images/deals/spa-1.jpg";

  useEffect(() => {
    const refresh = () => setDeals(getMarketplaceDeals());
    queueMicrotask(refresh);
    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /** Create a URL-safe slug from business name */
  function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  const brandSlug = toSlug(deal.merchant.businessName);
  const brandDeals = deals.filter((d) => d.merchant.id === deal.merchant.id && d.id !== deal.id);
  const relatedDeals = deals.filter((d) => d.id !== deal.id && d.merchant.id !== deal.merchant.id).slice(0, 4);
  const selectedOption = deal.options.find((option) => option.id === selectedOptionId) || deal.options[0];
  const totalPrice = (selectedOption?.dealPrice || deal.dealPrice) * quantity;

  function goToCheckout(buyAsGift: boolean) {
    saveCheckoutCart([createCartItemFromDeal(deal, selectedOption, quantity)], buyAsGift);
    router.push("/checkout");
  }

  const DEMO_REVIEWS = [
    { id: "r1", userName: "Rafiq A.", rating: 5, comment: "Absolutely amazing experience! The staff was professional and the service exceeded my expectations. Will definitely come back.", isVerified: true, createdAt: "2026-04-12" },
    { id: "r2", userName: "Fatima K.", rating: 4, comment: "Great deal for the price. The location was easy to find and the ambience was lovely. Highly recommend for couples.", isVerified: true, createdAt: "2026-04-08" },
    { id: "r3", userName: "Tanvir H.", rating: 5, comment: "Best value for money in Dhaka. I bought this as a gift and the recipient was thrilled. Redemption was smooth and hassle-free.", isVerified: true, createdAt: "2026-04-03" },
  ];

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className="container">
          <ol className={styles.breadcrumbList}>
            <li><Link href="/">Home</Link></li>
            <li><ChevronRight size={14} /></li>
            <li><Link href={`/category/${deal.category.slug}`}>{deal.category.name}</Link></li>
            <li><ChevronRight size={14} /></li>
            <li aria-current="page">{deal.merchant.businessName}</li>
          </ol>
        </div>
      </nav>

      <div className="container">
        <div className={styles.layout}>
          {/* Left Column — Image + Content */}
          <div className={styles.mainCol}>
            {/* Image Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainImage}>
                {currentImageSrc.startsWith("data:") ? (
                  <img src={currentImageSrc} alt={deal.title} className={styles.image} />
                ) : (
                  <Image
                    src={currentImageSrc}
                    alt={deal.title}
                    fill
                    priority
                    className={styles.image}
                  />
                )}
                {deal.images.length > 1 && (
                  <>
                    <button className={`${styles.galleryNav} ${styles.galleryPrev}`} onClick={() => setCurrentImage(Math.max(0, currentImage - 1))}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className={`${styles.galleryNav} ${styles.galleryNext}`} onClick={() => setCurrentImage(Math.min(deal.images.length - 1, currentImage + 1))}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className={styles.imageActions}>
                  <button className={cn(styles.imageAction, isWishlisted && styles.wishlisted)} onClick={() => setIsWishlisted(!isWishlisted)}>
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                  <button className={styles.imageAction}>
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button className={cn(styles.tab, activeTab === "description" && styles.tabActive)} onClick={() => setActiveTab("description")}>
                Description
              </button>
              <button className={cn(styles.tab, activeTab === "fineprint" && styles.tabActive)} onClick={() => setActiveTab("fineprint")}>
                Fine Print
              </button>
              <button className={cn(styles.tab, activeTab === "reviews" && styles.tabActive)} onClick={() => setActiveTab("reviews")}>
                Reviews ({deal.ratingCount.toLocaleString()})
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === "description" && (
                <div className={styles.description}>
                  <h2 className={styles.descTitle}>About This Deal</h2>
                  <p className={styles.descText}>{deal.description}</p>
                  <h3 className={styles.highlightsTitle}>What&apos;s Included</h3>
                  <ul className={styles.highlightsList}>
                    {deal.highlights.map((h, i) => (
                      <li key={i} className={styles.highlightItem}>
                        <CheckCircle2 size={16} className={styles.checkIcon} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "fineprint" && (
                <div className={styles.fineprint}>
                  <h2 className={styles.descTitle}>Fine Print</h2>
                  <ul className={styles.fineprintList}>
                    <li><AlertCircle size={14} /> Valid {deal.startDate} to {deal.endDate}</li>
                    <li><AlertCircle size={14} /> Limit {deal.maxPerUser} per person</li>
                    {deal.finePrint ? (
                      deal.finePrint.split(". ").filter(Boolean).map((line, i) => (
                        <li key={i}><AlertCircle size={14} /> {line.replace(/\.$/, "")}</li>
                      ))
                    ) : (
                      <>
                        <li><AlertCircle size={14} /> Appointment required; subject to availability</li>
                        <li><AlertCircle size={14} /> Not combinable with other offers</li>
                        <li><AlertCircle size={14} /> 24-hr cancellation policy</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className={styles.reviews}>
                  <div className={styles.reviewSummary}>
                    <div className={styles.reviewBig}>
                      <span className={styles.reviewScore}>{deal.ratingAvg}</span>
                      <StarRating rating={deal.ratingAvg} size={18} showCount={false} />
                      <span className={styles.reviewTotal}>{formatCount(deal.ratingCount)} reviews</span>
                    </div>
                  </div>
                  <div className={styles.reviewList}>
                    {DEMO_REVIEWS.map((review) => (
                      <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAvatar}>
                            {review.userName[0]}
                          </div>
                          <div>
                            <p className={styles.reviewName}>
                              {review.userName}
                              {review.isVerified && (
                                <span className={styles.reviewVerified}>
                                  <Shield size={12} /> Verified
                                </span>
                              )}
                            </p>
                            <p className={styles.reviewDate}>{review.createdAt}</p>
                          </div>
                          <div className={styles.reviewStars}>
                            <StarRating rating={review.rating} showCount={false} size={12} />
                          </div>
                        </div>
                        <p className={styles.reviewComment}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Merchant Info + Map */}
            <div className={styles.merchantSection}>
              <h3 className={styles.merchantSectionTitle}>About the Merchant</h3>
              <div className={styles.merchantCard}>
                <div className={styles.merchantInfo}>
                  <h4 className={styles.merchantCardName}>
                    <Link href={`/brands/${brandSlug}`} className={styles.merchantLink}>
                      {deal.merchant.businessName}
                      {deal.merchant.isVerified && <Shield size={14} className={styles.verifiedIcon} />}
                    </Link>
                  </h4>
                  <div className={styles.merchantMeta}>
                    <MapPin size={14} />
                    <span>{deal.merchant.address}, {deal.merchant.area}, {deal.merchant.city}</span>
                  </div>
                  <StarRating rating={deal.merchant.ratingAvg} count={deal.merchant.ratingCount} size={13} />
                </div>
                <div className={styles.merchantActions}>
                  <Link href={`/brands/${brandSlug}`} className={styles.merchantAction}>
                    <Store size={16} /> View all deals
                  </Link>
                  <button className={styles.merchantAction}>
                    <Phone size={16} /> Call
                  </button>
                  <button className={styles.merchantAction}>
                    <Navigation size={16} /> Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Purchase Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              {/* Title + Rating */}
              <h1 className={styles.dealTitle}>{deal.title}</h1>
              <div className={styles.dealMerchant}>
                <Link href={`/brands/${brandSlug}`} className={styles.merchantLink}>
                  {deal.merchant.businessName}
                </Link>
                {deal.merchant.isVerified && <Shield size={12} className={styles.verifiedIcon} />}
              </div>
              <div className={styles.dealMeta}>
                <MapPin size={13} />
                <span>{deal.merchant.area}, {deal.merchant.city}</span>
                {deal.merchant.distanceKm !== undefined && (
                  <span className={styles.dealDistance}>{formatDistance(deal.merchant.distanceKm)}</span>
                )}
              </div>
              <div className={styles.dealRating}>
                <StarRating rating={deal.ratingAvg} count={deal.ratingCount} size={14} />
              </div>

              {/* Divider */}
              <hr className={styles.divider} />

              {/* Select Option */}
              <div className={styles.optionSection}>
                <h3 className={styles.optionTitle}>Select Option</h3>
                <div className={styles.optionList}>
                  {deal.options.map((option) => (
                    <label
                      key={option.id}
                      className={cn(styles.optionItem, selectedOption?.id === option.id && styles.optionSelected)}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={option.id}
                        checked={selectedOption?.id === option.id}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="sr-only"
                      />
                      <div className={styles.optionRadio}>
                        <div className={styles.optionDot} />
                      </div>
                      <div className={styles.optionContent}>
                        <p className={styles.optionLabel}>{option.title}</p>
                        <PriceDisplay
                          originalPrice={option.originalPrice}
                          dealPrice={option.dealPrice}
                          size="sm"
                        />
                        <p className={styles.optionBought}>
                          <Users size={11} />
                          {formatCount(option.boughtCount)} bought
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className={styles.quantitySection}>
                <span className={styles.quantityLabel}>Quantity</span>
                <div className={styles.quantityControl}>
                  <button className={styles.quantityBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus size={16} />
                  </button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <button className={styles.quantityBtn} onClick={() => setQuantity(Math.min(deal.maxPerUser, quantity + 1))} disabled={quantity >= deal.maxPerUser}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className={styles.totalSection}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalPrice}>{formatBDT(totalPrice)}</span>
              </div>

              {/* CTAs */}
              <div className={styles.ctaSection}>
                <Button variant="primary" size="lg" fullWidth onClick={() => goToCheckout(false)}>
                  <CreditCard size={18} />
                  Buy Now
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={() => goToCheckout(true)}>
                  <Gift size={18} />
                  Buy As Gift
                </Button>
              </div>

              {/* Trust Badges */}
              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <Shield size={14} />
                  <span>Money-back Guarantee</span>
                </div>
                <div className={styles.trustItem}>
                  <CheckCircle2 size={14} />
                  <span>Verified Merchant</span>
                </div>
                <div className={styles.trustItem}>
                  <CreditCard size={14} />
                  <span>Secure bKash Payment</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* More Deals by This Brand */}
        {brandDeals.length > 0 && (
          <section className={styles.related}>
            <div className={styles.brandHeader}>
              <h2 className="section-title">More deals by {deal.merchant.businessName}</h2>
              <Link href={`/brands/${brandSlug}`} className={styles.viewAllLink}>
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="deal-grid">
              {brandDeals.slice(0, 4).map((d) => (
                <DealCard key={d.id} deal={d} />
              ))}
            </div>
          </section>
        )}

        {/* Related Deals */}
        <section className={styles.related}>
          <h2 className="section-title">You May Also Like</h2>
          <div className="deal-grid">
            {relatedDeals.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

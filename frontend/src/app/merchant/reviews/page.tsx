"use client";

import { MessageSquareText, Star } from "lucide-react";
import styles from "../merchant.module.css";

const STAR_DIST = [
  { stars: 5, count: 24, pct: 72 },
  { stars: 4, count: 8, pct: 24 },
  { stars: 3, count: 1, pct: 3 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

const REVIEWS = [
  { customer: "Nusrat Jahan", rating: 5, comment: "Clean place and very professional staff. Highly recommended!", status: "Needs reply" },
  { customer: "Arif Hasan", rating: 4, comment: "Good deal, booking could be faster. Overall a pleasant experience.", status: "Replied" },
];

const QUICK_REPLIES = [
  "Thank you for your kind feedback! We're glad you enjoyed our service.",
  "We appreciate your review! We'll work on improving the booking process.",
  "Thank you for visiting! We look forward to serving you again.",
];

export default function MerchantReviewsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Star size={16} /> Reviews</span>
          <h1 className={styles.heroTitle}>Customer feedback & ratings</h1>
          <p className={styles.heroText}>Build trust by replying promptly. Reviews affect conversion and merchant quality score.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Average rating</p>
          <p className={styles.heroPanelValue}>4.8</p>
          <p className={styles.heroPanelMeta}>2 reviews waiting for reply</p>
        </div>
      </section>

      {/* Star Distribution */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Rating breakdown</h2>
            <p className={styles.sectionSubtitle}>Distribution across all reviews</p>
          </div>
        </div>
        <div className={styles.starDist}>
          {STAR_DIST.map((s) => (
            <div className={styles.starRow} key={s.stars}>
              <span className={styles.starLabel}>{s.stars}★</span>
              <div className={styles.starBar}>
                <div className={styles.starBarFill} style={{ width: `${s.pct}%` }} />
              </div>
              <span className={styles.starCount}>{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent reviews</h2>
            <p className={styles.sectionSubtitle}>Reply, flag, or learn from feedback.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {REVIEWS.map((review) => (
            <div className={styles.reviewCard} key={review.customer}>
              <span className={styles.reviewAvatar}>{review.customer.charAt(0)}</span>
              <div className={styles.reviewBody}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
                  <p className={styles.itemTitle}>{review.customer}</p>
                  <span className={review.status === "Needs reply" ? styles.warningBadge : styles.successBadge}>{review.status}</span>
                </div>
                <div className={styles.reviewStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "#f59e0b" : "none"} stroke={i < review.rating ? "#f59e0b" : "var(--color-gray-300)"} />
                  ))}
                </div>
                <p className={styles.itemMeta}>{review.comment}</p>
                {review.status === "Needs reply" && (
                  <button className={styles.primaryButton} type="button" style={{ marginTop: "var(--space-3)", minHeight: 36, fontSize: "0.75rem" }}>
                    <MessageSquareText size={14} /> Reply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Reply Templates */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Quick reply templates</h2>
            <p className={styles.sectionSubtitle}>Tap to copy and use when replying to reviews.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {QUICK_REPLIES.map((reply, i) => (
            <div key={i} style={{ padding: "var(--space-3)", borderRadius: 12, background: "var(--color-gray-50)", border: "1px solid var(--color-gray-100)", fontSize: "0.78rem", color: "var(--color-gray-700)", lineHeight: 1.5, cursor: "pointer", transition: "border-color 0.15s" }}>
              {reply}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

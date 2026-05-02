"use client";

import { SITE_NAME } from "@/lib/constants";
import type { TemplateData } from "@/lib/template-definitions";
import styles from "./VoucherTemplate.module.css";

interface Props {
  data: TemplateData;
  /** Which of the 10 voucher styles (v1-v10) */
  styleKey: string;
}

/** Renders a square (1:1) branded voucher card */
export function VoucherTemplate({ data, styleKey }: Props) {
  const { shopLogo, productImage, headline, subtext, discountText, merchantName } = data;

  return (
    <div className={`${styles.voucherWrap} ${styles[styleKey] || styles.classicVoucher}`} data-template={styleKey}>
      {/* Product image (used by some templates) */}
      {productImage && (
        <div className={styles.bgImage} style={{ backgroundImage: `url(${productImage})` }} />
      )}

      {/* Overlay */}
      <div className={styles.overlay} />

      {/* Content */}
      <div className={styles.content}>
        {/* Shop logo at top */}
        <div className={styles.logoArea}>
          {shopLogo ? (
            <img src={shopLogo} alt={merchantName} className={styles.shopLogo} />
          ) : (
            <span className={styles.shopNameFallback}>{merchantName}</span>
          )}
        </div>

        {/* Discount circle / badge */}
        <div className={styles.centerArea}>
          {discountText && <span className={styles.discountBadge}>{discountText}</span>}
          <h3 className={styles.headline}>{headline || "Your Offer"}</h3>
          {subtext && <p className={styles.subtext}>{subtext}</p>}
        </div>

        {/* Dashed tear line (used by some templates) */}
        <div className={styles.tearLine} />

        {/* Branding */}
        <div className={styles.brandingArea}>
          <span className={styles.watermark}>{SITE_NAME}</span>
        </div>
      </div>
    </div>
  );
}

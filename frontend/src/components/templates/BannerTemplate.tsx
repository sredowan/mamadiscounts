"use client";

import { SITE_NAME } from "@/lib/constants";
import type { TemplateData } from "@/lib/template-definitions";
import styles from "./BannerTemplate.module.css";

interface Props {
  data: TemplateData;
  /** Which of the 10 banner styles (b1-b10) */
  styleKey: string;
}

/** Renders a branded banner at slider dimensions (100% width × 300px mobile) */
export function BannerTemplate({ data, styleKey }: Props) {
  const { shopLogo, productImage, headline, subtext, discountText, merchantName } = data;

  return (
    <div className={`${styles.bannerWrap} ${styles[styleKey] || styles.emeraldBold}`} data-template={styleKey}>
      {/* Product image background layer */}
      {productImage && (
        <div className={styles.bgImage} style={{ backgroundImage: `url(${productImage})` }} />
      )}

      {/* Overlay gradient per template */}
      <div className={styles.overlay} />

      {/* Content layer */}
      <div className={styles.content}>
        {/* Shop logo top-left */}
        <div className={styles.logoArea}>
          {shopLogo ? (
            <img src={shopLogo} alt={merchantName} className={styles.shopLogo} />
          ) : (
            <span className={styles.shopNameFallback}>{merchantName}</span>
          )}
        </div>

        {/* Center text */}
        <div className={styles.textArea}>
          {discountText && <span className={styles.discountBadge}>{discountText}</span>}
          <h3 className={styles.headline}>{headline || "Your Offer Headline"}</h3>
          {subtext && <p className={styles.subtext}>{subtext}</p>}
        </div>

        {/* Branding watermark */}
        <span className={styles.watermark}>{SITE_NAME}</span>
      </div>
    </div>
  );
}

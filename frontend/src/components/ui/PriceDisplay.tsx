import { formatBDT, calcDiscount } from "@/lib/utils";
import styles from "./PriceDisplay.module.css";

interface PriceDisplayProps {
  originalPrice: number;
  dealPrice: number;
  extraDiscount?: number;
  extraLabel?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  originalPrice,
  dealPrice,
  extraDiscount,
  extraLabel,
  size = "md",
}: PriceDisplayProps) {
  const discount = calcDiscount(originalPrice, dealPrice);
  const finalPrice = extraDiscount ? dealPrice - extraDiscount : dealPrice;

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <div className={styles.row}>
        {originalPrice > dealPrice && (
          <span className={styles.original}>{formatBDT(originalPrice)}</span>
        )}
        <span className={styles.current}>{formatBDT(dealPrice)}</span>
        {discount > 0 && (
          <span className={styles.discount}>-{discount}%</span>
        )}
      </div>
      {extraDiscount && extraDiscount > 0 && (
        <div className={styles.extra}>
          <span className={styles.extraPrice}>{formatBDT(finalPrice)}</span>
          {extraLabel && <span className={styles.extraLabel}>{extraLabel}</span>}
        </div>
      )}
    </div>
  );
}

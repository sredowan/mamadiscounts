import { Star, StarHalf } from "lucide-react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}

export function StarRating({ rating, count, size = 14, showCount = true }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className={styles.wrapper} aria-label={`${rating} out of 5 stars`}>
      <span className={styles.stars}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`f-${i}`} size={size} className={styles.filled} />
        ))}
        {hasHalf && <StarHalf size={size} className={styles.filled} />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`e-${i}`} size={size} className={styles.empty} />
        ))}
      </span>
      <span className={styles.value}>{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className={styles.count}>({count.toLocaleString()})</span>
      )}
    </span>
  );
}

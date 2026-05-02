"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, Flame, Sparkles } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const pathname = usePathname();

  // Determine active category from URL
  const activeSlug = pathname.startsWith("/category/")
    ? pathname.split("/category/")[1]?.split("/")[0]
    : null;

  const isDealsPage = pathname === "/deals" || pathname.startsWith("/search");

  return (
    <aside className={styles.sidebar} aria-label="Category navigation">
      {/* Quick Access */}
      <span className={styles.sectionLabel}>Quick Access</span>
      <nav className={styles.navList}>
        <Link
          href="/deals"
          className={`${styles.navItem} ${styles.navItemHighlight} ${isDealsPage ? styles.navItemActive : ""}`}
        >
          <span className={styles.navIcon}>
            <Flame size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.navLabel}>Bestsellers</span>
        </Link>
        <Link
          href="/search?q=new arrivals"
          className={styles.navItem}
        >
          <span className={styles.navIcon}>
            <Sparkles size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.navLabel}>New Arrivals</span>
        </Link>
      </nav>

      <div className={styles.divider} />

      {/* All Categories */}
      <span className={styles.sectionLabel}>Categories</span>
      <nav className={styles.navList}>
        {CATEGORIES.map((cat) => {
          const isActive = activeSlug === cat.slug;
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span
                className={styles.navIcon}
                style={{ color: isActive ? "#0b8043" : cat.color } as React.CSSProperties}
              >
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <span className={styles.navLabel}>{cat.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Bottom Promo */}
      <div className={styles.sidebarBottom}>
        <Link href="/deals" className={styles.promoCard}>
          <span className={styles.promoIcon}>
            <BadgePercent size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.promoTitle}>Up to 75% Off</span>
          <span className={styles.promoSubtitle}>Shop today&apos;s deals</span>
        </Link>
      </div>
    </aside>
  );
}

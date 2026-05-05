"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Flame, Sparkles, BadgePercent } from "lucide-react";
import { SITE_NAME, CATEGORIES } from "@/lib/constants";
import styles from "./MobileTopHeader.module.css";

export function MobileTopHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const menuToggleRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    const checkbox = menuToggleRef.current;
    if (!checkbox) return;

    function syncBodyScroll() {
      document.body.style.overflow = checkbox?.checked ? "hidden" : "";
    }

    syncBodyScroll();
    checkbox.addEventListener("change", syncBodyScroll);
    return () => {
      checkbox.removeEventListener("change", syncBodyScroll);
      document.body.style.overflow = "";
    };
  }, []);

  function closeMenu() {
    if (menuToggleRef.current) {
      menuToggleRef.current.checked = false;
      menuToggleRef.current.dispatchEvent(new Event("change"));
    }
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search");
  }

  const activeSlug = pathname.startsWith("/category/")
    ? pathname.split("/category/")[1]?.split("/")[0]
    : null;

  return (
    <>
      <input
        ref={menuToggleRef}
        id="mobile-menu-toggle"
        className={styles.menuCheckbox}
        type="checkbox"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className={styles.mobileHeaderWrapper}>
        {/* Top row: logo + actions */}
        <div className={styles.topRow}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>{SITE_NAME}</span>
            <span className={styles.logoSubtext}>Deals near you</span>
          </Link>

          <div className={styles.headerActions}>
            <label
              className={styles.hamburgerBtn}
              aria-label="Open categories menu"
              aria-controls="mobile-categories-menu"
              htmlFor="mobile-menu-toggle"
              role="button"
              tabIndex={0}
            >
              <Menu size={22} />
            </label>
          </div>
        </div>

        {/* Search row */}
        <div className={styles.searchRow}>
          <form className={styles.searchWrap} onSubmit={submitSearch}>
            <Search size={16} className={styles.searchIcon} />
            <input
              id="mobile-search-input"
              type="search"
              placeholder="Search deals, food, spa..."
              className={styles.input}
              aria-label="Search deals"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </form>
        </div>
      </div>

      {/* ── Megamenu Drawer ─────────────────────────── */}
      {/* Always rendered, visibility controlled by CSS class */}
      <div
        className={styles.drawerOverlay}
        onClick={closeMenu}
      >
        <aside
          id="mobile-categories-menu"
          className={styles.drawer}
          onClick={(e) => e.stopPropagation()}
          aria-label="Categories menu"
          aria-modal="true"
          role="dialog"
        >
          {/* Drawer header */}
          <div className={styles.drawerHeader}>
            <div>
              <span className={styles.drawerLogo}>{SITE_NAME}</span>
              <span className={styles.drawerLead}>Browse offers by category</span>
            </div>
            <label
              className={styles.drawerClose}
              aria-label="Close menu"
              htmlFor="mobile-menu-toggle"
              role="button"
              tabIndex={0}
            >
              <X size={22} />
            </label>
          </div>

          {/* Quick access */}
          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionLabel}>Quick Access</span>
            <div className={styles.quickGrid}>
              <Link href="/deals" className={styles.quickCard} onClick={closeMenu}>
                <span className={styles.drawerItemIcon} style={{ color: "#ef4444" }}>
                  <Flame size={20} />
                </span>
                <span>Bestsellers</span>
              </Link>
              <Link href="/search?q=new" className={styles.quickCard} onClick={closeMenu}>
                <span className={styles.drawerItemIcon} style={{ color: "#8b5cf6" }}>
                  <Sparkles size={20} />
                </span>
                <span>New Arrivals</span>
              </Link>
            </div>
          </div>

          <div className={styles.drawerDivider} />

          {/* Categories */}
          <div className={styles.drawerSection}>
            <span className={styles.drawerSectionLabel}>All Categories</span>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeSlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`${styles.categoryCard} ${isActive ? styles.drawerItemActive : ""}`}
                    onClick={closeMenu}
                  >
                    <span className={styles.drawerItemIcon} style={{ color: isActive ? "#0b8043" : cat.color }}>
                      <Icon size={20} />
                    </span>
                    <span className={styles.drawerItemLabel}>{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={styles.drawerDivider} />

          {/* Bottom promo */}
          <div className={styles.drawerPromo}>
            <Link href="/deals" className={styles.drawerPromoCard} onClick={closeMenu}>
              <BadgePercent size={20} />
              <div>
                <strong>Up to 75% Off</strong>
                <span>Shop today&apos;s deals</span>
              </div>
            </Link>
          </div>

          {/* Account links */}
          <div className={styles.drawerSection}>
            <Link href="/merchant/login" className={styles.drawerLink} onClick={closeMenu}>Merchant Portal</Link>
            <Link href="/auth/login" className={styles.drawerLink} onClick={closeMenu}>Sign In</Link>
          </div>
        </aside>
      </div>
    </>
  );
}

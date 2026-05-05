"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, Bell, ShoppingBag, CircleUser, Menu, X } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import styles from "./Header.module.css";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search");
  }

  return (
    <header className={styles.header}>
      {/* Promo Banner */}
      <div className={styles.promoBanner}>
        <div className="container">
          <p className={styles.promoText}>
            <Zap size={14} />
            Top-Rated Deals — Up to <strong>75% off</strong> with code <strong>BDDEALS</strong>
            <Link href="/deals" className={styles.promoLink}>
              Shop Now
            </Link>
          </p>
        </div>
      </div>

      {/* Main Header — [Logo] [Search] [Icons] */}
      <div className={styles.main}>
        <div className={`container ${styles.inner}`}>
          {/* Logo — Top Left */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>C</span>
            <span className={styles.logoText}>{SITE_NAME}</span>
          </Link>

          {/* Search Bar - Primary focal point (centered) */}
          <form className={styles.searchWrap} onSubmit={submitSearch}>
            <input
              type="search"
              placeholder="Search Spa, Deals, Restaurants..."
              className={styles.input}
              aria-label="Search deals"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button className={styles.searchSubmit} type="submit" aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Right Actions */}
          <div className={styles.actions}>
            <Link href="/wishlist" className={styles.iconBtn} aria-label="Saved">
              <Heart size={22} strokeWidth={2} />
            </Link>
            <Link href="/notifications" className={styles.iconBtn} aria-label="Notifications">
              <Bell size={22} strokeWidth={2} />
            </Link>
            <Link href="/checkout" className={styles.iconBtn} aria-label="Cart">
              <ShoppingBag size={22} strokeWidth={2} />
            </Link>
            <Link href="/customer/login" className={styles.userBtn} aria-label="Sign in">
              <CircleUser size={22} strokeWidth={2} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Zap({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

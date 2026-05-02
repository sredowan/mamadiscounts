"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import styles from "./MobileTopHeader.module.css";

export function MobileTopHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = searchQuery.trim();
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search");
  }

  return (
    <div className={styles.mobileHeaderWrapper}>
      {/* Logo */}
      <div className={styles.logoRow}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>{SITE_NAME}</span>
        </Link>
      </div>

      {/* Quick Search */}
      <div className={styles.searchRow}>
        <form className={styles.searchWrap} onSubmit={submitSearch}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search for deals, food, spa..."
            className={styles.input}
            aria-label="Search deals"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import styles from "./MobileNav.module.css";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Offers", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wish lists", icon: Heart },
  { href: "/checkout", label: "Carts", icon: ShoppingBag },
  { href: "/account", label: "Account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(styles.item, isActive && styles.active)}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

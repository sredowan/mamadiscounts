"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeHelp,
  BarChart3,
  Bell,
  Code2,
  HandCoins,
  LayoutDashboard,
  Menu,
  Plus,
  QrCode,
  Search,
  Settings,
  Star,
  Store,
  Ticket,
  X,
  LogOut,
  Megaphone,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutMerchant } from "@/lib/deal-store";
import styles from "./MerchantShell.module.css";

function getAuthSession() {
  if (typeof window === "undefined") return null;
  const session = localStorage.getItem("couponus_user");
  if (session) {
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  }
  return null;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/merchant/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/merchant/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/merchant/deals", label: "Deals", icon: Ticket, badge: "3" },
      { href: "/merchant/vouchers", label: "Vouchers", icon: QrCode },
      { href: "/merchant/integrations", label: "Integrations", icon: Code2 },
      { href: "/merchant/payouts", label: "Payouts", icon: HandCoins },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/merchant/reviews", label: "Reviews", icon: Star, badge: "2" },
      { href: "/merchant/promotions", label: "Promotions", icon: Megaphone },
      { href: "/merchant/profile", label: "Store Profile", icon: Store },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/merchant/settings", label: "Settings", icon: Settings },
    ],
  },
];

const MOBILE_NAV = [
  { href: "/merchant/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/merchant/vouchers", label: "Scan", icon: QrCode },
  { href: "/merchant/deals", label: "Deals", icon: Ticket },
  { href: "/merchant/promotions", label: "Promote", icon: Megaphone },
  { href: "/merchant/analytics", label: "Stats", icon: BarChart3 },
];

const FAB_ACTIONS = [
  { href: "/merchant/vouchers", label: "Scan QR", icon: QrCode, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  { href: "/merchant/deals/new", label: "New Deal", icon: Ticket, color: "#7c3aed", bg: "#f5f3ff" },
  { href: "/merchant/promotions", label: "Promote", icon: Megaphone, color: "#db2777", bg: "#fdf2f8" },
  { href: "/merchant/payouts", label: "Payouts", icon: Wallet, color: "#f59e0b", bg: "#fffbeb" },
];

type MerchantUser = {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/merchant/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ pathname, user, onLogout }: { pathname: string; user: MerchantUser; onLogout: () => void }) {
  return (
    <>
      <Link href="/merchant/dashboard" className={styles.brand}>
        <span className={styles.logoIcon}>C</span>
        <span>
          <span className={styles.brandLabel}>COUPONUS BD</span>
          <span className={styles.brandSub}>Merchant Center</span>
        </span>
      </Link>

      <div className={styles.businessCard}>
        <div>
          <p className={styles.businessName}>{user?.fullName || "Merchant"}</p>
          <p className={styles.businessMeta}>Verified since Jan 2026</p>
        </div>
        <span className={styles.verified}>Pro</span>
      </div>

      <Link href="/merchant/deals/new" className={styles.createDeal}>
        <Plus size={16} /> Create Deal
      </Link>

      <nav className={styles.navList}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className={styles.navSection}>{section.label}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItem, isActive(pathname, item.href) && styles.navActive)}
              >
                <item.icon size={17} />
                {item.label}
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <Link href="/merchant/help" className={styles.helpCard}>
        <BadgeHelp size={16} />
        <span>Need help with a voucher or payout?</span>
      </Link>

      <button className={styles.logoutBtn} onClick={onLogout} type="button">
        <LogOut size={16} />
        Log out
      </button>
    </>
  );
}

export function MerchantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [user, setUser] = useState<MerchantUser | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const session = getAuthSession();
      if (!session) {
        router.push("/merchant/login");
      } else {
        setUser(session);
      }
    });
  }, [router]);

  function handleLogout() {
    logoutMerchant();
    router.push("/merchant/login");
  }

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    queueMicrotask(() => {
      closeMobileMenu();
      setFabOpen(false);
    });
  }, [pathname, closeMobileMenu]);

  if (!user) return null;

  return (
    <div className={styles.shell}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar} aria-label="Merchant navigation">
        <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Side Drawer */}
      {mobileMenuOpen && (
        <>
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
          <aside className={styles.mobileSidebar} aria-label="Mobile navigation">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-3)" }}>
              <button onClick={closeMobileMenu} style={{ color: "white", padding: "4px", background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
          </aside>
        </>
      )}

      {/* Workspace */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button
            className={styles.menuHamburger}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className={styles.mobileBrand}>
            <span className={styles.logoIcon} style={{ width: 30, height: 30, fontSize: "0.75rem", borderRadius: 8 }}>C</span>
            <span>
              <strong>{user.fullName || "Merchant"}</strong>
              <small>Merchant Center</small>
            </span>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} />
            <input type="search" placeholder="Search deals, vouchers, payouts..." />
          </div>

          <div className={styles.topActions}>
            <Link href="/merchant/vouchers" className={styles.scanTopAction}>
              <QrCode size={15} /> Scan
            </Link>
            <button className={styles.iconButton} type="button" aria-label="Notifications">
              <Bell size={17} />
              <span className={styles.notificationDot} />
            </button>
            <button className={styles.iconButton} type="button" aria-label="Logout" onClick={handleLogout} title="Log out">
              <LogOut size={17} />
            </button>
            <button className={styles.avatarButton} type="button" aria-label="Account menu">
              {(user.fullName || "M").charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

      {/* FAB */}
      <button
        className={cn(styles.fab, fabOpen && styles.fabOpen)}
        onClick={() => setFabOpen(!fabOpen)}
        aria-label="Quick actions"
        type="button"
      >
        <Plus size={24} />
      </button>

      {/* FAB Menu */}
      {fabOpen && (
        <>
          <div className={styles.fabOverlay} onClick={() => setFabOpen(false)} />
          <div className={styles.fabMenu}>
            {FAB_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={styles.fabMenuItem}
                onClick={() => setFabOpen(false)}
              >
                <span className={styles.fabMenuIcon} style={{ background: action.bg, color: action.color }}>
                  <action.icon size={16} />
                </span>
                {action.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(styles.mobileNavItem, isActive(pathname, item.href) && styles.mobileActive)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

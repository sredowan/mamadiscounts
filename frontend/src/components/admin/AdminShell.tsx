"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Ticket,
  Users,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { API_URL, cn } from "@/lib/utils";
import styles from "./AdminShell.module.css";

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

const ADMIN_NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/merchants", label: "Merchants", icon: Store },
      { href: "/admin/deals", label: "All Deals", icon: Ticket },
      { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
      { href: "/admin/users", label: "Users (Customers)", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const MOBILE_NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
  { href: "/admin/deals", label: "Deals", icon: Ticket },
  { href: "/admin/promotions", label: "Promos", icon: Megaphone },
  { href: "/admin/settings", label: "More", icon: Menu },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function clearAdminSession() {
  localStorage.removeItem("couponus_user");
  localStorage.removeItem("couponus_token");
  localStorage.removeItem("couponus_access_token");
  localStorage.removeItem("couponus_refresh_token");
}

function getAccessToken() {
  return localStorage.getItem("couponus_access_token") || localStorage.getItem("couponus_token");
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("couponus_refresh_token");
  if (!refreshToken) return null;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  localStorage.setItem("couponus_user", JSON.stringify(data.user));
  localStorage.setItem("couponus_token", data.accessToken);
  localStorage.setItem("couponus_access_token", data.accessToken);
  localStorage.setItem("couponus_refresh_token", data.refreshToken);
  return data.accessToken as string;
}

async function fetchAdminUser(token: string): Promise<AdminUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;

  const user = await response.json() as AdminUser;
  return user.role === "ADMIN" ? user : null;
}

function AdminSidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      <Link href="/admin/dashboard" className={styles.brand}>
        <span className={styles.logoIcon}>C</span>
        <span>
          <span className={styles.brandLabel}>COUPONUS BD</span>
          <span className={styles.brandSub}>Admin Control</span>
        </span>
      </Link>

      <div className={styles.adminCard}>
        <div>
          <p className={styles.adminName}>Super Admin</p>
          <p className={styles.adminMeta}>System Owner</p>
        </div>
        <span className={styles.superBadge}><ShieldCheck size={14} /> Admin</span>
      </div>

      <nav className={styles.navList}>
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className={styles.navSection}>{section.label}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItem, isActive(pathname, item.href) && styles.navActive)}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function requireAdminSession() {
      try {
        const token = getAccessToken();
        const validToken = token === "demo-merchant-token-hardcoded" ? null : token;
        let user = validToken ? await fetchAdminUser(validToken) : null;

        if (!user) {
          const refreshedToken = await refreshAccessToken();
          user = refreshedToken ? await fetchAdminUser(refreshedToken) : null;
        }

        if (cancelled) return;

        if (user) {
          localStorage.setItem("couponus_user", JSON.stringify(user));
          setAdminUser(user);
          return;
        }

        clearAdminSession();
        router.replace("/admin/login");
      } catch {
        if (cancelled) return;
        clearAdminSession();
        router.replace("/admin/login");
      }
    }

    requireAdminSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    clearAdminSession();
    router.push("/admin/login");
  }

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    queueMicrotask(closeMobileMenu);
  }, [pathname, closeMobileMenu]);

  if (!adminUser) return null;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Admin navigation">
        <AdminSidebarContent pathname={pathname} />
      </aside>

      {mobileMenuOpen && (
        <>
          <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
          <aside className={styles.mobileSidebar} aria-label="Mobile navigation">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-4)" }}>
              <button onClick={closeMobileMenu} style={{ color: "white", padding: "4px", background: "transparent", border: "none" }}>
                <X size={24} />
              </button>
            </div>
            <AdminSidebarContent pathname={pathname} />
          </aside>
        </>
      )}

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button
            className={styles.menuHamburger}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className={styles.mobileBrand}>
            <span className={styles.logoIcon} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>C</span>
            <span>
              <strong>Super Admin</strong>
              <small>Admin Center</small>
            </span>
          </div>

          <div className={styles.topActions}>
            <button className={styles.iconButton} type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <button className={styles.iconButton} type="button" aria-label="Logout" onClick={handleLogout} title="Log out admin">
              <LogOut size={18} />
            </button>
            <button className={styles.avatarButton} type="button" aria-label="Account menu">
              SA
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>

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

"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileTopHeader } from "@/components/layout/MobileTopHeader";
import { Footer } from "@/components/layout/Footer";
import styles from "./AppChrome.module.css";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMerchantRoute = pathname.startsWith("/merchant");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isMerchantRoute || isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <MobileTopHeader />
      <div className={styles.appLayout}>
        <Sidebar />
        <div className={styles.mainColumn}>
          <main id="main-content">{children}</main>
          <Footer />
        </div>
      </div>
      <MobileNav />
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { MerchantShell } from "@/components/merchant/MerchantShell";

const STANDALONE_ROUTES = ["/merchant/register", "/merchant/signup", "/merchant/login"];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (STANDALONE_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return <MerchantShell>{children}</MerchantShell>;
}

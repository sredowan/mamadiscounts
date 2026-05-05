"use client";

import { BadgePercent } from "lucide-react";
import { LoginExperience } from "@/components/auth/LoginExperience";

export default function CustomerLoginPage() {
  return (
    <LoginExperience
      role="CUSTOMER"
      eyebrow="Customer deals wallet"
      title="Sign in to your vouchers"
      subtitle="Track purchases, redeem saved vouchers, and keep your best Bangladesh deals in one place."
      icon={BadgePercent}
      redirectTo="/account/vouchers"
      accent="emerald"
      demo={{ label: "Demo customer", email: "customer@demo.com", password: "Customer@2026" }}
      registerHref="/auth/register"
      registerLabel="New to COUPONUS BD?"
      alternateLinks={[
        { label: "Merchant login", href: "/merchant/login" },
        { label: "Admin login", href: "/admin/login" },
      ]}
    />
  );
}

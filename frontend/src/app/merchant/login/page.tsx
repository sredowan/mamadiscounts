"use client";

import { Store } from "lucide-react";
import { LoginExperience } from "@/components/auth/LoginExperience";

export default function MerchantLoginPage() {
  return (
    <LoginExperience
      role="MERCHANT"
      eyebrow="Merchant workspace"
      title="Merchant sign in"
      subtitle="Manage deals, scan vouchers, launch sponsored promotions, and track store performance."
      icon={Store}
      redirectTo="/merchant/dashboard"
      accent="emerald"
      demo={{ label: "Demo merchant", email: "spa@demo.com", password: "Merchant@2026" }}
      registerHref="/merchant/register"
      registerLabel="Need a merchant account?"
      alternateLinks={[
        { label: "Customer login", href: "/customer/login" },
        { label: "Admin login", href: "/admin/login" },
      ]}
      allowMerchantFallback
    />
  );
}

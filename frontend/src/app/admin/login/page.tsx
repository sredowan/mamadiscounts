"use client";

import { ShieldCheck } from "lucide-react";
import { LoginExperience } from "@/components/auth/LoginExperience";

export default function AdminLoginPage() {
  return (
    <LoginExperience
      role="ADMIN"
      eyebrow="Admin control room"
      title="Secure admin sign in"
      subtitle="Review merchants, approve campaigns, and manage COUPONUS BD operations."
      icon={ShieldCheck}
      redirectTo="/admin/dashboard"
      accent="slate"
      demo={{ label: "Demo admin", email: "admin@couponusbd.com", password: "Admin@2026" }}
      alternateLinks={[
        { label: "Merchant login", href: "/merchant/login" },
        { label: "Customer login", href: "/customer/login" },
      ]}
    />
  );
}

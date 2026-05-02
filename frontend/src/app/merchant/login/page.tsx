"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, LogIn } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { loginMerchant } from "@/lib/deal-store";
import styles from "./login.module.css";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      const session = await loginMerchant(email, password);
      
      if (session) {
        router.push("/merchant/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.page}>
        <div className={styles.loginCard}>
          <div className={styles.logo}>
            <Store size={24} />
          </div>
          <h1 className={styles.title}>Merchant Login</h1>
          <p className={styles.subtitle}>Sign in to manage your deals and vouchers.</p>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <input 
                className={styles.uxInput} 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="contact@business.com" 
              />
            </div>
            
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input 
                className={styles.uxInput} 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••" 
              />
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button className={styles.btnPrimary} type="submit" disabled={loading}>
              <LogIn size={18} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className={styles.footerText}>
            Don't have a merchant account? <Link href="/merchant/register">Register here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

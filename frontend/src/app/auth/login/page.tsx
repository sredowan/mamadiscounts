"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/utils";
import styles from "./page.module.css";

const DEMO_MERCHANT = {
  email: "spa@demo.com",
  password: "Merchant@2026",
};

type LoginResponse = {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  };
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(email, password);
  };

  const login = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in");
      }

      const auth = data as LoginResponse;
      localStorage.setItem("couponus_access_token", auth.accessToken);
      localStorage.setItem("couponus_refresh_token", auth.refreshToken);
      localStorage.setItem("couponus_user", JSON.stringify(auth.user));

      if (auth.user.role === "MERCHANT") {
        router.push("/merchant/dashboard");
        return;
      }
      if (auth.user.role === "ADMIN") {
        router.push("/admin/dashboard");
        return;
      }
      router.push("/account/vouchers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoMerchant = async () => {
    setEmail(DEMO_MERCHANT.email);
    setPassword(DEMO_MERCHANT.password);
    await login(DEMO_MERCHANT.email, DEMO_MERCHANT.password);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>C</span>
          </Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to access your deals and vouchers</p>
        </div>

        <div className={styles.demoBox}>
          <div>
            <strong>Demo merchant</strong>
            <span>{DEMO_MERCHANT.email} / {DEMO_MERCHANT.password}</span>
          </div>
          <button type="button" onClick={loginAsDemoMerchant} disabled={loading}>
            Login as merchant
          </button>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={18} className={styles.fieldIcon} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={18} className={styles.fieldIcon} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eyeBtn}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/auth/forgot" className={styles.forgot}>Forgot password?</Link>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Sign In
            <ArrowRight size={16} />
          </Button>
        </form>

        <p className={styles.switchAuth}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className={styles.switchLink}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

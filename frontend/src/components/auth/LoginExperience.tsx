"use client";

import { useState } from "react";
import type { ElementType, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { loginMerchant } from "@/lib/deal-store";
import { API_URL, cn } from "@/lib/utils";
import styles from "./LoginExperience.module.css";

type UserRole = "CUSTOMER" | "MERCHANT" | "ADMIN";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
};

type DemoCredential = {
  label: string;
  email: string;
  password: string;
};

type RoleLink = {
  label: string;
  href: string;
};

type LoginExperienceProps = {
  role: UserRole;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ElementType;
  redirectTo: string;
  accent: "emerald" | "slate" | "violet";
  demo?: DemoCredential;
  registerHref?: string;
  registerLabel?: string;
  alternateLinks?: RoleLink[];
  allowMerchantFallback?: boolean;
};

function storeAuthSession(auth: LoginResponse) {
  localStorage.setItem("couponus_token", auth.accessToken);
  localStorage.setItem("couponus_access_token", auth.accessToken);
  localStorage.setItem("couponus_refresh_token", auth.refreshToken);
  localStorage.setItem("couponus_user", JSON.stringify(auth.user));
}

function clearAuthSession() {
  localStorage.removeItem("couponus_token");
  localStorage.removeItem("couponus_access_token");
  localStorage.removeItem("couponus_refresh_token");
  localStorage.removeItem("couponus_user");
}

export function LoginExperience({
  role,
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  redirectTo,
  accent,
  demo,
  registerHref,
  registerLabel,
  alternateLinks = [],
  allowMerchantFallback = false,
}: LoginExperienceProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login(loginEmail: string, loginPassword: string) {
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
      if (auth.user.role !== role) {
        clearAuthSession();
        throw new Error(`This account is registered as ${auth.user.role.toLowerCase()}, not ${role.toLowerCase()}.`);
      }

      storeAuthSession(auth);
      router.push(redirectTo);
    } catch (err) {
      if (allowMerchantFallback) {
        const session = await loginMerchant(loginEmail, loginPassword);
        if (session) {
          router.push(redirectTo);
          return;
        }
      }
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await login(email, password);
  }

  async function handleDemoLogin(credential: DemoCredential) {
    setEmail(credential.email);
    setPassword(credential.password);
    await login(credential.email, credential.password);
  }

  return (
    <main className={cn(styles.page, styles[accent])}>
      <section className={styles.panel} aria-label={`${title} form`}>
        {/* Brand accent header strip */}
        <div className={styles.visual}>
          <div className={styles.visualContent}>
            <span className={styles.eyebrow}>
              <Icon size={12} />
              {eyebrow}
            </span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>

        {/* Form card */}
        <div className={styles.card}>
          <Link href="/" className={styles.brand} aria-label="Go to homepage">
            <span className={styles.brandMark}>C</span>
            <span>COUPONUS BD</span>
          </Link>

          {demo && (
            <div className={styles.demoBox}>
              <div>
                <strong>{demo.label}</strong>
                <span>{demo.email} / {demo.password}</span>
              </div>
              <button type="button" onClick={() => void handleDemoLogin(demo)} disabled={loading}>
                Use demo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email">Email address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.fieldIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={styles.input}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.fieldIcon} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={styles.input}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className={styles.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={styles.formMeta}>
              <Link href="/auth/forgot">Forgot password?</Link>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign in
              <ArrowRight size={15} />
            </Button>
          </form>

          {(registerHref || alternateLinks.length > 0) && (
            <div className={styles.footerLinks}>
              {registerHref && registerLabel && (
                <p>
                  {registerLabel} <Link href={registerHref}>Create account</Link>
                </p>
              )}
              {alternateLinks.length > 0 && (
                <div className={styles.alternateLinks}>
                  {alternateLinks.map((link) => (
                    <Link key={link.href} href={link.href}>{link.label}</Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

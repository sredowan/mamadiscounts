"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "../login/page.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>C</span>
          </Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join COUPONUS BD and start saving today</p>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrap}>
              <User size={18} className={styles.fieldIcon} />
              <input type="text" placeholder="Your full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={styles.input} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={18} className={styles.fieldIcon} />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className={styles.input} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Phone (Optional)</label>
            <div className={styles.inputWrap}>
              <Phone size={18} className={styles.fieldIcon} />
              <input type="tel" placeholder="+880 1XXXXXXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={styles.input} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <Lock size={18} className={styles.fieldIcon} />
              <input type={showPass ? "text" : "password"} placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} className={styles.input} required minLength={8} />
              <button type="button" onClick={() => setShowPass(!showPass)} className={styles.eyeBtn}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Create Account
            <ArrowRight size={16} />
          </Button>
        </form>

        <p className={styles.switchAuth}>
          Already have an account?{" "}
          <Link href="/auth/login" className={styles.switchLink}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

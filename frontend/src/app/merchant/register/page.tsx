"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, FileText, HandCoins, MapPin, Save, Store, User } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { addRegisteredMerchant } from "@/lib/deal-store";
import styles from "./register.module.css";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");

    addRegisteredMerchant({
      businessName: String(formData.get("businessName") || "New Merchant"),
      ownerName: String(formData.get("ownerName") || "Owner"),
      email: String(formData.get("email") || "merchant@example.com"),
      phone: String(formData.get("phone") || ""),
      category: String(formData.get("category") || "Other services"),
      address: String(formData.get("address") || ""),
      area: String(formData.get("area") || ""),
      city: String(formData.get("city") || "Dhaka"),
      payoutMethod: String(formData.get("payoutMethod") || "bKash merchant"),
      password: password || undefined,
    });
    setSubmitted(true);
    setTimeout(() => router.push("/merchant/login"), 1500);
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.page}>
        <div className={styles.container}>
          <section className={styles.brandHero}>
            <div>
              <span className={styles.eyebrow}><Store size={16} /> Merchant registration</span>
              <h1 className={styles.heroTitle}>Grow your business with COUPONUS BD</h1>
              <p className={styles.heroText}>Register your business details, upload verification documents, and start offering deals to thousands of customers.</p>
            </div>
            <div className={styles.heroPanel}>
              <p className={styles.heroPanelLabel}>Review status</p>
              <p className={styles.heroPanelValue}>Pending</p>
              <p className={styles.heroPanelMeta}>Admin verification required</p>
            </div>
          </section>

          <form className={styles.splitGrid} onSubmit={submitRegistration}>
            <div className={styles.glassCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Business information</h2>
                  <p className={styles.sectionSubtitle}>Required for your storefront and deal pages.</p>
                </div>
                <Building2 size={24} />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="businessName">Business name</label>
                  <input className={styles.uxInput} id="businessName" name="businessName" required placeholder="e.g. Serenity Thai Spa" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="category">Business category</label>
                  <select className={styles.uxSelect} id="category" name="category" required>
                    <option>Restaurant</option>
                    <option>Spa, salon, beauty</option>
                    <option>Retail and clothing</option>
                    <option>Hotel bookings</option>
                    <option>Tours and activities</option>
                    <option>Other services</option>
                  </select>
                </div>
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="description">Business description</label>
                  <textarea className={styles.uxTextarea} id="description" name="description" placeholder="Briefly describe your services..." />
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: "2.5rem" }}>
                <div>
                  <h2 className={styles.sectionTitle}>Owner & contact</h2>
                  <p className={styles.sectionSubtitle}>Primary contact for approvals and account access.</p>
                </div>
                <User size={24} />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="ownerName">Full name</label>
                  <input className={styles.uxInput} id="ownerName" name="ownerName" required placeholder="Owner or Manager name" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="email">Email address</label>
                  <input className={styles.uxInput} id="email" name="email" type="email" required placeholder="contact@business.com" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="phone">Phone number</label>
                  <input className={styles.uxInput} id="phone" name="phone" required placeholder="01700-000000" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="website">Website (Optional)</label>
                  <input className={styles.uxInput} id="website" name="website" placeholder="https://..." />
                </div>
                <div className={styles.field}>
                  <label htmlFor="password">Create Password</label>
                  <input className={styles.uxInput} id="password" name="password" type="password" required placeholder="Min 6 characters" minLength={6} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input className={styles.uxInput} id="confirmPassword" name="confirmPassword" type="password" required placeholder="Confirm password" />
                </div>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: "2.5rem" }}>
                <div>
                  <h2 className={styles.sectionTitle}>Location details</h2>
                  <p className={styles.sectionSubtitle}>Where can customers find you?</p>
                </div>
                <MapPin size={24} />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="address">Full address</label>
                  <input className={styles.uxInput} id="address" name="address" required placeholder="House 12, Road 5, Block C" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="area">Area / Neighborhood</label>
                  <input className={styles.uxInput} id="area" name="area" required placeholder="Gulshan 1" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="city">City</label>
                  <input className={styles.uxInput} id="city" name="city" required defaultValue="Dhaka" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="hours">Business hours</label>
                  <input className={styles.uxInput} id="hours" name="hours" placeholder="10:00 AM - 10:00 PM" />
                </div>
              </div>
            </div>

            <aside className={styles.glassCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Verification</h2>
                  <p className={styles.sectionSubtitle}>Upload documents for approval.</p>
                </div>
                <FileText size={24} />
              </div>
              <div className={styles.mediaGrid}>
                <label className={styles.uxUploadBox}>
                  <input type="file" accept="image/*,.pdf" />
                  <FileText size={24} />
                  <strong>Trade license</strong>
                  <span>PDF or Image</span>
                </label>
                <label className={styles.uxUploadBox}>
                  <input type="file" accept="image/*,.pdf" />
                  <User size={24} />
                  <strong>Owner NID</strong>
                  <span>Identity verification</span>
                </label>
              </div>

              <div className={styles.sectionHeader} style={{ marginTop: "2.5rem" }}>
                <div>
                  <h2 className={styles.sectionTitle}>Payout details</h2>
                  <p className={styles.sectionSubtitle}>Where you will receive your funds.</p>
                </div>
                <HandCoins size={24} />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="payoutMethod">Payout method</label>
                  <select className={styles.uxSelect} id="payoutMethod" name="payoutMethod">
                    <option>bKash merchant</option>
                    <option>Nagad merchant</option>
                    <option>Bank account</option>
                  </select>
                </div>
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="payoutNumber">Account number</label>
                  <input className={styles.uxInput} id="payoutNumber" name="payoutNumber" placeholder="Enter account details" />
                </div>
              </div>

              <div className={styles.actionRow}>
                <button className={styles.btnPrimary} type="submit">
                  <Save size={18} /> Submit Application
                </button>
                <Link href="/merchant/login" className={styles.btnSecondary}>
                  Cancel
                </Link>
              </div>
              {error && <p className={styles.itemMeta} style={{ color: 'var(--color-error)' }}>{error}</p>}
              {submitted && <p className={styles.itemMeta}>✓ Application submitted! Your profile will be live once after review.</p>}
            </aside>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

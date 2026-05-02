"use client";

import { useState } from "react";
import { BadgeHelp, ChevronDown, ChevronUp, LifeBuoy, MessageCircle, Phone } from "lucide-react";
import styles from "../merchant.module.css";

const FAQS = [
  { q: "How do I create my first deal?", a: "Go to Deals → New Deal. Choose a template, set your pricing, inventory, and redemption rules. Submit for review and your deal will be live within 24 hours." },
  { q: "When do I get paid?", a: "Payouts are processed on your selected settlement cycle (weekly, bi-weekly, or monthly). You can check payout status in the Payouts section." },
  { q: "What if a customer disputes a voucher?", a: "Contact support via WhatsApp or open a ticket. Provide the voucher code and details. Our team resolves disputes within 48 hours." },
  { q: "How do I verify my business?", a: "Go to Settings → Business Verification. Upload your trade license, NID, and optionally your TIN/BIN. Verification takes 1-3 business days." },
  { q: "Can I pause a live deal?", a: "Yes. Go to Deals → find your deal → click Pause. The deal will stop appearing to customers but existing vouchers remain valid." },
];

export default function MerchantHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><BadgeHelp size={16} /> Merchant help</span>
          <h1 className={styles.heroTitle}>Support & resources</h1>
          <p className={styles.heroText}>Get help with vouchers, campaigns, payouts, account verification, and more.</p>
        </div>
      </section>

      {/* Help Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
        <div className={styles.card} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-primary-50)", color: "var(--color-primary-600)", display: "grid", placeItems: "center" }}><LifeBuoy size={20} /></span>
          <p className={styles.itemTitle}>Open support ticket</p>
          <p className={styles.itemMeta}>Voucher dispute, payout issue, rejected deal, or verification.</p>
          <button className={styles.secondaryButton} type="button">Create ticket</button>
        </div>
        <div className={styles.card} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: "#dcfce7", color: "#16a34a", display: "grid", placeItems: "center" }}><MessageCircle size={20} /></span>
          <p className={styles.itemTitle}>WhatsApp support</p>
          <p className={styles.itemMeta}>Fast answers for restaurants, salons, hotels, and retail merchants.</p>
          <a href="https://wa.me/8801871186562" target="_blank" rel="noopener noreferrer" className={styles.primaryButton} style={{ minHeight: 40, fontSize: "0.78rem" }}>
            <MessageCircle size={15} /> Chat on WhatsApp
          </a>
        </div>
        <div className={styles.card} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: "#eff6ff", color: "#3b82f6", display: "grid", placeItems: "center" }}><Phone size={20} /></span>
          <p className={styles.itemTitle}>Call support</p>
          <p className={styles.itemMeta}>Available 10 AM - 8 PM, Saturday to Thursday.</p>
          <button className={styles.secondaryButton} type="button"><Phone size={14} /> Call now</button>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
            <p className={styles.sectionSubtitle}>Quick answers to common merchant questions.</p>
          </div>
        </div>
        <div className={styles.faqList}>
          {FAQS.map((faq, i) => (
            <div className={styles.faqItem} key={i}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                type="button"
              >
                {faq.q}
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && <div className={styles.faqAnswer}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

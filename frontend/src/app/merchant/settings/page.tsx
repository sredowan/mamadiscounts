"use client";

import { useEffect, useState } from "react";
import { Bell, CreditCard, Palette, Plus, Save, ShieldCheck, Trash2, Users } from "lucide-react";
import styles from "../merchant.module.css";

const TEAM_MEMBERS = [
  { name: "Spa Owner", email: "spa@demo.com", role: "Owner", access: "Full access" },
  { name: "Front Desk", email: "frontdesk@serenityspa.com", role: "Cashier", access: "Scan vouchers only" },
  { name: "Finance Manager", email: "finance@serenityspa.com", role: "Finance", access: "Payouts and reports" },
];

const NOTIFICATIONS = [
  { label: "Voucher sold alerts", sub: "Get notified on every sale", default: true },
  { label: "Voucher redemption alerts", sub: "When a customer redeems", default: true },
  { label: "Low inventory warnings", sub: "When deal capacity is nearly full", default: true },
  { label: "Payout status updates", sub: "Settlement and transfer notifications", default: true },
  { label: "Daily performance summary", sub: "Morning recap of yesterday", default: false },
];

const PRESET_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#ec4899", "#14b8a6", "#1e293b"];

export default function MerchantSettingsPage() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS.map((n) => n.default));
  const [brandColor, setBrandColor] = useState("#10b981");
  const [brandSaved, setBrandSaved] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem("cpb_merchant_brand_color");
      if (saved) setBrandColor(saved);
    });
  }, []);

  function toggleNotif(index: number) {
    setNotifs((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function saveBrandColor() {
    localStorage.setItem("cpb_merchant_brand_color", brandColor);
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2000);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Settings</span>
          <h1 className={styles.heroTitle}>Account & team settings</h1>
          <p className={styles.heroText}>Manage brand, team access, notifications, verification, and payout methods.</p>
        </div>
      </section>

      {/* Brand Customization */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Brand customization</h2>
            <p className={styles.sectionSubtitle}>Set your brand color for voucher brochures and physical QR tickets.</p>
          </div>
          <Palette size={20} style={{ color: "var(--color-gray-400)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                style={{
                  width: 48, height: 48, border: "2px solid var(--color-gray-200)", borderRadius: 12,
                  cursor: "pointer", padding: 2, background: "var(--color-white)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBrandColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: brandColor === c ? "2px solid var(--color-gray-900)" : "2px solid transparent",
                    background: c, cursor: "pointer", transition: "all 0.15s", outline: brandColor === c ? "2px solid var(--color-white)" : "none",
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: brandColor, flexShrink: 0 }} />
            <code style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-gray-600)" }}>{brandColor}</code>
            <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>— will be used on voucher brochures and QR tickets</span>
          </div>
          <div>
            {/* Preview banner */}
            <div style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`, color: "#fff",
              padding: "var(--space-4) var(--space-5)", borderRadius: 14, display: "flex",
              alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700,
            }}>
              <span>Serenity Thai Spa — Voucher Preview</span>
              <span style={{ opacity: 0.7, fontSize: "0.65rem" }}>Powered by Couponus BD</span>
            </div>
          </div>
        </div>
        <div className={styles.actionRow} style={{ marginTop: "var(--space-4)" }}>
          <button className={styles.primaryButton} type="button" onClick={saveBrandColor}>
            <Save size={16} /> {brandSaved ? "Saved ✓" : "Save brand color"}
          </button>
        </div>
      </section>

      {/* Team */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Team and permissions</h2>
            <p className={styles.sectionSubtitle}>Invite staff and control portal access.</p>
          </div>
          <button className={styles.primaryButton} type="button"><Plus size={16} /> Invite</button>
        </div>

        {/* Desktop */}
        <div className={styles.desktopOnly}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Member</th><th>Role</th><th>Access</th><th>Actions</th></tr></thead>
              <tbody>
                {TEAM_MEMBERS.map((m) => (
                  <tr key={m.email}>
                    <td><strong>{m.name}</strong><p className={styles.itemMeta}>{m.email}</p></td>
                    <td><span className={styles.neutralBadge}>{m.role}</span></td>
                    <td>{m.access}</td>
                    <td><button className={styles.secondaryButton} type="button"><Trash2 size={15} /> Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className={styles.mobileCardList}>
          {TEAM_MEMBERS.map((m) => (
            <div className={styles.mobileCard} key={m.email}>
              <div className={styles.mobileCardHead}>
                <div>
                  <p className={styles.itemTitle}>{m.name}</p>
                  <p className={styles.itemMeta}>{m.email}</p>
                </div>
                <span className={styles.neutralBadge}>{m.role}</span>
              </div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Access</span><span className={styles.mobileCardValue}>{m.access}</span></div>
              <div className={styles.mobileCardActions}><button type="button"><Trash2 size={13} /> Remove</button></div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications with Toggle Switches */}
      <section className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Notifications</h2>
              <p className={styles.sectionSubtitle}>Choose which alerts you receive.</p>
            </div>
            <Bell size={20} style={{ color: "var(--color-gray-400)" }} />
          </div>
          <div className={styles.toggleList}>
            {NOTIFICATIONS.map((n, i) => (
              <div className={styles.toggleRow} key={n.label}>
                <div>
                  <p className={styles.toggleLabel}>{n.label}</p>
                  <p className={styles.toggleSub}>{n.sub}</p>
                </div>
                <button
                  className={`${styles.toggle} ${notifs[i] ? styles.toggleOn : ""}`}
                  onClick={() => toggleNotif(i)}
                  type="button"
                  aria-label={`Toggle ${n.label}`}
                />
              </div>
            ))}
          </div>
          <div className={styles.actionRow}><button className={styles.primaryButton} type="button"><Save size={16} /> Save</button></div>
        </div>

        <aside className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Security</h2>
              <p className={styles.sectionSubtitle}>Protect business and payout access.</p>
            </div>
            <ShieldCheck size={20} style={{ color: "var(--color-gray-400)" }} />
          </div>
          <div className={styles.toggleList}>
            {[
              { label: "Strong passwords", on: true },
              { label: "OTP for payout changes", on: false },
              { label: "Email on team changes", on: true },
            ].map((s) => (
              <div className={styles.toggleRow} key={s.label}>
                <p className={styles.toggleLabel}>{s.label}</p>
                <button className={`${styles.toggle} ${s.on ? styles.toggleOn : ""}`} type="button" aria-label={`Toggle ${s.label}`} />
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Verification & Payout */}
      <section className={styles.splitGrid}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Business verification</h2>
              <p className={styles.sectionSubtitle}>Upload legal documents for verified status.</p>
            </div>
          </div>
          <div className={styles.mediaGrid}>
            <label className={styles.uploadBox}><input type="file" accept="image/*,.pdf" /><ShieldCheck size={24} /><strong>Trade license</strong><span>PDF or image</span></label>
            <label className={styles.uploadBox}><input type="file" accept="image/*,.pdf" /><Users size={24} /><strong>NID / owner ID</strong><span>Front and back</span></label>
            <label className={styles.uploadBox}><input type="file" accept="image/*,.pdf" /><CreditCard size={24} /><strong>TIN / BIN</strong><span>Optional</span></label>
          </div>
        </div>

        <aside className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Payout method</h2>
              <p className={styles.sectionSubtitle}>Where settlements are sent.</p>
            </div>
          </div>
          <form className={styles.formGrid}>
            <div className={styles.field}><label htmlFor="payoutType">Method</label><select id="payoutType" defaultValue="bkash"><option value="bkash">bKash merchant</option><option value="nagad">Nagad merchant</option><option value="bank">Bank account</option></select></div>
            <div className={styles.field}><label htmlFor="accountNumber">Account number</label><input id="accountNumber" defaultValue="01700-000000" /></div>
            <div className={styles.field}><label htmlFor="accountName">Account name</label><input id="accountName" defaultValue="Serenity Thai Spa" /></div>
            <div className={styles.field}><label htmlFor="settlementCycle">Settlement cycle</label><select id="settlementCycle" defaultValue="weekly"><option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option></select></div>
          </form>
          <div className={styles.actionRow}><button className={styles.primaryButton} type="button"><Save size={16} /> Save</button></div>
        </aside>
      </section>
    </div>
  );
}

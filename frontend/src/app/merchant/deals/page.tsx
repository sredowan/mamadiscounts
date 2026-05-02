"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Copy, Pause, Plus, Ticket } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import styles from "../merchant.module.css";

const DEALS = [
  { title: "Luxury Thai Spa Package", type: "Beauty & spa", status: "Active", sold: 184, cap: 250, revenue: 257600, rating: 4.8 },
  { title: "Couple Relaxation Voucher", type: "Beauty & spa", status: "Active", sold: 64, cap: 100, revenue: 230400, rating: 4.7 },
  { title: "Royal Facial and Hair Spa", type: "Salon", status: "Pending review", sold: 0, cap: 120, revenue: 0, rating: 0 },
  { title: "Weekday Massage Trial", type: "Beauty & spa", status: "Paused", sold: 92, cap: 140, revenue: 145360, rating: 4.5 },
];

const FILTERS = ["All", "Active", "Paused", "Pending"];

export default function MerchantDealsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = DEALS.filter((d) => filter === "All" || d.status === filter || (filter === "Pending" && d.status === "Pending review"));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Ticket size={16} /> Campaign manager</span>
          <h1 className={styles.heroTitle}>Your deals & campaigns</h1>
          <p className={styles.heroText}>Create, track, and manage all your active deals in one place.</p>
          <div className={styles.heroActions}>
            <Link href="/merchant/deals/new" className={styles.primaryButton}><Plus size={18} /> Create new deal</Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Active campaigns</p>
          <p className={styles.heroPanelValue}>3</p>
          <p className={styles.heroPanelMeta}>2 performing above target</p>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>My deals</h2>
            <p className={styles.sectionSubtitle}>Review status, inventory, and revenue.</p>
          </div>
          <Link href="/merchant/deals/new" className={styles.secondaryButton}><Plus size={16} /> New deal</Link>
        </div>

        {/* Filter Chips */}
        <div className={styles.filterChips}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.filterChip} ${filter === f ? styles.filterChipActive : ""}`}
              onClick={() => setFilter(f)}
              type="button"
            >{f}</button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className={styles.desktopOnly}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Deal</th><th>Status</th><th>Sold</th><th>Revenue</th><th>Rating</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((deal) => (
                  <tr key={deal.title}>
                    <td><strong>{deal.title}</strong><p className={styles.itemMeta}>{deal.type}</p></td>
                    <td><span className={deal.status === "Active" ? styles.successBadge : deal.status === "Paused" ? styles.neutralBadge : styles.warningBadge}>{deal.status}</span></td>
                    <td>{deal.sold}/{deal.cap}</td>
                    <td>{formatBDT(deal.revenue)}</td>
                    <td>{deal.rating ? deal.rating.toFixed(1) : "New"}</td>
                    <td>
                      <div className={styles.actionRow} style={{ marginTop: 0 }}>
                        <button className={styles.secondaryButton} type="button"><BarChart3 size={15} /> View</button>
                        <button className={styles.secondaryButton} type="button"><Copy size={15} /> Copy</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className={styles.mobileCardList}>
          {filtered.map((deal) => (
            <div className={styles.mobileCard} key={deal.title}>
              <div className={styles.mobileCardHead}>
                <div>
                  <p className={styles.itemTitle}>{deal.title}</p>
                  <p className={styles.itemMeta}>{deal.type}</p>
                </div>
                <span className={deal.status === "Active" ? styles.successBadge : deal.status === "Paused" ? styles.neutralBadge : styles.warningBadge}>{deal.status}</span>
              </div>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Sold</span>
                <span className={styles.mobileCardValue}>{deal.sold}/{deal.cap}</span>
              </div>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Revenue</span>
                <span className={styles.mobileCardValue}>{formatBDT(deal.revenue)}</span>
              </div>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Rating</span>
                <span className={styles.mobileCardValue}>{deal.rating ? `${deal.rating.toFixed(1)} ★` : "New"}</span>
              </div>
              <div className={styles.mobileCardActions}>
                <button type="button"><BarChart3 size={13} /> View</button>
                <button type="button"><Copy size={13} /> Duplicate</button>
                <button type="button"><Pause size={13} /> Pause</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

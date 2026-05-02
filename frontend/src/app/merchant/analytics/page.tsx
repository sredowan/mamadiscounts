"use client";

import { useState } from "react";
import { BarChart3, Clock, MapPin, TrendingUp } from "lucide-react";
import styles from "../merchant.module.css";

const PERIODS = ["7 days", "30 days", "90 days"];

const PEAK_HOURS = [
  { time: "6-9 PM", pct: 92, label: "Peak" },
  { time: "12-2 PM", pct: 64, label: "High" },
  { time: "10-12 PM", pct: 41, label: "Medium" },
  { time: "2-6 PM", pct: 28, label: "Low" },
];

export default function MerchantAnalyticsPage() {
  const [period, setPeriod] = useState("30 days");

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><BarChart3 size={16} /> Analytics</span>
          <h1 className={styles.heroTitle}>Campaign performance & insights</h1>
          <p className={styles.heroText}>Revenue trends, customer behavior, redemption timing, and deal conversion analytics.</p>
        </div>
      </section>

      {/* Period Toggle */}
      <div className={styles.filterChips}>
        {PERIODS.map((p) => (
          <button
            key={p}
            className={`${styles.filterChip} ${period === p ? styles.filterChipActive : ""}`}
            onClick={() => setPeriod(p)}
            type="button"
          >{p}</button>
        ))}
      </div>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><TrendingUp size={22} /></span>
          <div className={styles.statCardInfo}>
            <p className={styles.statLabel}>Conversion</p>
            <p className={styles.statValue}>8.4%</p>
            <p className={styles.statTrend} style={{ color: "var(--color-success)" }}>+1.2% vs last period</p>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><Clock size={22} /></span>
          <div className={styles.statCardInfo}>
            <p className={styles.statLabel}>Peak time</p>
            <p className={styles.statValue}>6-9 PM</p>
            <p className={styles.statMeta}>Highest booking demand</p>
          </div>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statIcon}><MapPin size={22} /></span>
          <div className={styles.statCardInfo}>
            <p className={styles.statLabel}>Top area</p>
            <p className={styles.statValue}>Gulshan</p>
            <p className={styles.statMeta}>32% of voucher buyers</p>
          </div>
        </article>
      </section>

      {/* Peak Hours Heatmap */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Booking demand by hour</h2>
            <p className={styles.sectionSubtitle}>When customers book the most ({period})</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {PEAK_HOURS.map((h) => (
            <div key={h.time} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span style={{ minWidth: 60, fontSize: "0.75rem", fontWeight: 700, color: "var(--color-gray-600)" }}>{h.time}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--color-gray-100)", overflow: "hidden" }}>
                <div style={{ width: `${h.pct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, var(--color-primary-400), var(--color-primary-600))`, transition: "width 0.6s ease-out" }} />
              </div>
              <span style={{ minWidth: 48, fontSize: "0.65rem", fontWeight: 700, color: h.pct > 80 ? "var(--color-primary-700)" : "var(--color-gray-400)" }}>{h.label} {h.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion Trend Mini Chart */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Conversion trend</h2>
            <p className={styles.sectionSubtitle}>Profile views → purchases ({period})</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", height: 100 }}>
          {[4.2, 5.1, 6.8, 5.9, 7.2, 8.1, 8.4].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ width: "100%", maxWidth: 32, borderRadius: "6px 6px 2px 2px", background: `linear-gradient(180deg, var(--color-primary-400), var(--color-primary-600))`, height: `${(v / 10) * 100}%`, transition: "height 0.6s ease-out", minHeight: 4 }} />
              <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "var(--color-gray-400)" }}>{v}%</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

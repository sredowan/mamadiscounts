"use client";

import Link from "next/link";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3,
  CalendarClock, Clock, HandCoins, Megaphone, Plus, QrCode,
  ShoppingBag, Sparkles, Star, Ticket, TrendingUp, Users, Wallet, Zap,
} from "lucide-react";
import { formatBDT } from "@/lib/utils";
import styles from "./dashboard.module.css";

/* ── Helpers ──────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Data ─────────────────────────────────────────── */
const STATS = [
  { icon: HandCoins, label: "Revenue", value: formatBDT(72500), trend: "+12.5%", up: true, accent: "var(--color-primary-500)" },
  { icon: Ticket, label: "Sold", value: "245", trend: "+8.2%", up: true, accent: "#7c3aed" },
  { icon: BarChart3, label: "Conv.", value: "6.4%", trend: "-0.8%", up: false, accent: "#f59e0b" },
  { icon: Star, label: "Rating", value: "4.8", trend: "+0.2", up: true, accent: "#ef4444" },
];

const QUICK_ACTIONS = [
  { href: "/merchant/vouchers", icon: QrCode, label: "Scan", color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  { href: "/merchant/deals/new", icon: Plus, label: "New Deal", color: "#7c3aed", bg: "#f5f3ff" },
  { href: "/merchant/promotions", icon: Megaphone, label: "Promote", color: "#db2777", bg: "#fdf2f8" },
  { href: "/merchant/payouts", icon: Wallet, label: "Payouts", color: "#f59e0b", bg: "#fffbeb" },
];

const SNAPSHOT = [
  { label: "Sold today", value: "18", icon: ShoppingBag, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  { label: "Redeemed", value: "11", icon: QrCode, color: "#7c3aed", bg: "#f5f3ff" },
  { label: "Pending", value: formatBDT(382500), icon: HandCoins, color: "#f59e0b", bg: "#fffbeb" },
];

const CAMPAIGNS = [
  { title: "Luxury Thai Spa Package", sold: 184, cap: 250, revenue: 257600, status: "active" as const },
  { title: "90-Min Royal Massage", sold: 92, cap: 140, revenue: 145360, status: "active" as const },
  { title: "Couple Relaxation Experience", sold: 64, cap: 100, revenue: 230400, status: "expiring" as const },
];

const WEEKLY = [
  { day: "M", rev: 42 }, { day: "T", rev: 38 }, { day: "W", rev: 52 },
  { day: "T", rev: 61 }, { day: "F", rev: 73 }, { day: "S", rev: 89 }, { day: "S", rev: 95 },
];
const MAX_REV = Math.max(...WEEKLY.map((d) => d.rev));

const ACTIVITY = [
  { text: "18 vouchers sold across 3 campaigns", time: "Just now", type: "earn" as const },
  { text: "11 vouchers redeemed today", time: "Last at 4:35 PM", type: "redeem" as const },
  { text: "Couple Relaxation expiring in 4 days", time: "64/100 sold", type: "warn" as const },
  { text: "2 new reviews waiting for reply", time: "Reply to build trust", type: "action" as const },
];

const TIPS = [
  { icon: CalendarClock, title: "Open peak slots", sub: "Fri 6-9 PM fills fastest" },
  { icon: Users, title: "Reply to reviews", sub: "2 unanswered this week" },
  { icon: Ticket, title: "Add inventory", sub: "Thai spa at 75% cap" },
  { icon: BarChart3, title: "Adjust pricing", sub: "12% above category avg" },
];

export default function MerchantDashboard() {
  return (
    <div className={styles.dash}>
      {/* ── Greeting Bar ────────────────────── */}
      <section className={styles.greeting}>
        <div className={styles.greetLeft}>
          <p className={styles.greetHi}>{getGreeting()} 👋</p>
          <h1 className={styles.greetName}>Serenity Spa</h1>
          <span className={styles.greetBadge}><BadgeCheck size={11} /> Verified</span>
        </div>
        <div className={styles.greetPayout}>
          <span className={styles.payoutLabel}>Pending</span>
          <span className={styles.payoutValue}>{formatBDT(382500)}</span>
          <span className={styles.payoutMeta}><ArrowUpRight size={11} /> Friday</span>
        </div>
      </section>

      {/* ── Today's Snapshot ────────────────── */}
      <section className={styles.snapshotStrip}>
        {SNAPSHOT.map((s) => (
          <div className={styles.snapItem} key={s.label}>
            <span className={styles.snapIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon size={14} />
            </span>
            <div>
              <span className={styles.snapLabel}>{s.label}</span>
              <span className={styles.snapValue}>{s.value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Quick Actions ──────────────────── */}
      <section className={styles.quickRow}>
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} className={styles.quickBtn}>
            <span className={styles.quickIcon} style={{ background: a.bg, color: a.color }}>
              <a.icon size={20} />
            </span>
            <span className={styles.quickLabel}>{a.label}</span>
          </Link>
        ))}
      </section>

      {/* ── Stats Cards ────────────────────── */}
      <section className={styles.statsRow}>
        {STATS.map((s) => (
          <div className={styles.stat} key={s.label}>
            <span className={styles.statDot} style={{ background: s.accent }} />
            <div className={styles.statBody}>
              <span className={styles.statLbl}>{s.label}</span>
              <span className={styles.statVal}>{s.value}</span>
              <span className={`${styles.statTrend} ${s.up ? styles.up : styles.down}`}>
                {s.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {s.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Expiring Deal Alert ────────────── */}
      <section className={styles.expiringAlert}>
        <AlertTriangle size={18} />
        <div className={styles.expiringText}>
          <p className={styles.expiringTitle}>Deal expiring soon</p>
          <p className={styles.expiringSub}>Couple Relaxation Experience — 4 days left, 64/100 sold</p>
        </div>
        <Link href="/merchant/deals" className={styles.expiringAction}>
          Manage <ArrowRight size={10} />
        </Link>
      </section>

      {/* ── Mini Chart ─────────────────────── */}
      <section className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.cardTitle}>This Week</h2>
            <p className={styles.cardSub}>Revenue trend (k)</p>
          </div>
          <Link href="/merchant/analytics" className={styles.seeAll}>
            Details <ArrowRight size={11} />
          </Link>
        </div>
        <div className={styles.barChart}>
          {WEEKLY.map((d, i) => (
            <div className={styles.bar} key={i}>
              <div className={styles.barFill} style={{ height: `${(d.rev / MAX_REV) * 100}%` }} />
              <span className={styles.barDay}>{d.day}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Active Campaigns ───────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.cardTitle}>Active Deals</h2>
          <Link href="/merchant/deals" className={styles.seeAll}>
            All <ArrowRight size={11} />
          </Link>
        </div>
        <div className={styles.dealList}>
          {CAMPAIGNS.map((c) => {
            const pct = Math.round((c.sold / c.cap) * 100);
            return (
              <div className={styles.dealItem} key={c.title}>
                <div className={styles.dealTop}>
                  <p className={styles.dealTitle}>{c.title}</p>
                  <span className={c.status === "expiring" ? styles.tagWarn : styles.tagLive}>
                    {c.status === "expiring" ? <Clock size={9} /> : <Sparkles size={9} />}
                    {c.status === "expiring" ? "Expiring" : "Live"}
                  </span>
                </div>
                <div className={styles.dealMeta}>
                  <span>{c.sold}/{c.cap} sold</span>
                  <span>{formatBDT(c.revenue)}</span>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Activity Feed ──────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.cardTitle}>Activity</h2>
        <div className={styles.feedList}>
          {ACTIVITY.map((a, i) => (
            <div className={styles.feedItem} key={i}>
              <span className={styles.feedDot} style={{
                background: a.type === "warn" ? "#f59e0b" : a.type === "action" ? "#ef4444" : a.type === "redeem" ? "#7c3aed" : "var(--color-primary-500)",
              }} />
              <div className={styles.feedBody}>
                <p className={styles.feedText}>{a.text}</p>
                <p className={styles.feedTime}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Tips ─────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.cardTitle}><Zap size={13} style={{ color: "#f59e0b" }} /> Smart Tips</h2>
        </div>
        <div className={styles.tipsGrid}>
          {TIPS.map((t) => (
            <div className={styles.tipCard} key={t.title}>
              <span className={styles.tipIcon}><t.icon size={14} /></span>
              <div>
                <p className={styles.tipTitle}>{t.title}</p>
                <p className={styles.tipSub}>{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Growth Banner ──────────────────── */}
      <section className={styles.growthBanner}>
        <TrendingUp size={20} style={{ position: "relative" }} />
        <div>
          <p className={styles.growthTitle}>Growth Score: Top 18%</p>
          <p className={styles.growthSub}>Outperforming 82% of merchants in your category</p>
        </div>
      </section>
    </div>
  );
}

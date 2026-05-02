import { Banknote, CalendarClock, Download, HandCoins } from "lucide-react";
import { formatBDT } from "@/lib/utils";
import styles from "../merchant.module.css";

const PAYOUTS = [
  { period: "Apr 15 - Apr 21", gross: 185000, commission: 27750, net: 157250, status: "Processing" },
  { period: "Apr 08 - Apr 14", gross: 220000, commission: 33000, net: 187000, status: "Paid" },
  { period: "Apr 01 - Apr 07", gross: 164000, commission: 24600, net: 139400, status: "Paid" },
];

export default function MerchantPayoutsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><HandCoins size={16} /> Payout center</span>
          <h1 className={styles.heroTitle}>Earnings & settlements</h1>
          <p className={styles.heroText}>Track gross sales, commission, and net payouts transparently.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Available balance</p>
          <p className={styles.heroPanelValue}>{formatBDT(382500)}</p>
          <p className={styles.heroPanelMeta}>Next payout: Friday</p>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}><span className={styles.statIcon}><Banknote size={22} /></span><div className={styles.statCardInfo}><p className={styles.statLabel}>Total paid</p><p className={styles.statValue}>{formatBDT(326400)}</p><p className={styles.statMeta}>Last 30 days</p></div></article>
        <article className={styles.statCard}><span className={styles.statIcon}><CalendarClock size={22} /></span><div className={styles.statCardInfo}><p className={styles.statLabel}>Pending</p><p className={styles.statValue}>{formatBDT(382500)}</p><p className={styles.statMeta}>Processing after checks</p></div></article>
        <article className={styles.statCard}><span className={styles.statIcon}><HandCoins size={22} /></span><div className={styles.statCardInfo}><p className={styles.statLabel}>Commission</p><p className={styles.statValue}>15%</p><p className={styles.statMeta}>Current agreement</p></div></article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Payout history</h2>
            <p className={styles.sectionSubtitle}>Download receipts and check settlement details.</p>
          </div>
        </div>

        {/* Desktop */}
        <div className={styles.desktopOnly}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Period</th><th>Gross sales</th><th>Commission</th><th>Net payout</th><th>Status</th><th>Receipt</th></tr></thead>
              <tbody>
                {PAYOUTS.map((p) => (
                  <tr key={p.period}>
                    <td>{p.period}</td><td>{formatBDT(p.gross)}</td><td>{formatBDT(p.commission)}</td>
                    <td><strong>{formatBDT(p.net)}</strong></td>
                    <td><span className={p.status === "Paid" ? styles.successBadge : styles.warningBadge}>{p.status}</span></td>
                    <td><button className={styles.secondaryButton} type="button"><Download size={15} /> PDF</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className={styles.mobileCardList}>
          {PAYOUTS.map((p) => (
            <div className={styles.mobileCard} key={p.period}>
              <div className={styles.mobileCardHead}>
                <p className={styles.itemTitle}>{p.period}</p>
                <span className={p.status === "Paid" ? styles.successBadge : styles.warningBadge}>{p.status}</span>
              </div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Gross</span><span className={styles.mobileCardValue}>{formatBDT(p.gross)}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Commission</span><span className={styles.mobileCardValue}>{formatBDT(p.commission)}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Net payout</span><span className={styles.mobileCardValue} style={{ color: "var(--color-primary-700)" }}>{formatBDT(p.net)}</span></div>
              <div className={styles.mobileCardActions}>
                <button type="button"><Download size={13} /> Download PDF</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

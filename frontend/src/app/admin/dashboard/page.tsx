"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Ticket, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert } from "lucide-react";
import { DEAL_STORE_CHANGED, getManagedDeals, getRegisteredMerchants } from "@/lib/deal-store";
import styles from "../../merchant/merchant.module.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalDeals: 0,
    activeDeals: 0,
    pendingDeals: 0,
    totalMerchants: 0,
    pendingMerchants: 0,
  });

  function refresh() {
    const deals = getManagedDeals();
    const merchants = getRegisteredMerchants();
    
    setStats({
      totalDeals: deals.length,
      activeDeals: deals.filter(d => d.status === "active").length,
      pendingDeals: deals.filter(d => d.reviewStatus === "pending_review").length,
      totalMerchants: merchants.length,
      pendingMerchants: merchants.filter(m => m.verificationStatus === "pending").length,
    });
  }

  useEffect(() => {
    queueMicrotask(refresh);
    window.addEventListener(DEAL_STORE_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(DEAL_STORE_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><ShieldAlert size={16} /> Command Center</span>
          <h1 className={styles.heroTitle}>Platform Overview</h1>
          <p className={styles.heroText}>Monitor overall platform health, recent activity, and pending approvals.</p>
        </div>
      </section>

      {/* KPI Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        <div className={styles.tableCard} style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Revenue (Est.)</span>
            <DollarSign size={20} />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>৳124,500</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
            <ArrowUpRight size={16} /> +12% this month
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Merchants</span>
            <Store size={20} />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>{stats.totalMerchants}</div>
          <div style={{ marginTop: 'var(--space-2)', color: stats.pendingMerchants > 0 ? 'var(--color-warning)' : 'var(--color-gray-500)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
            {stats.pendingMerchants} pending review
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Deals</span>
            <Ticket size={20} />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>{stats.activeDeals}</div>
          <div style={{ marginTop: 'var(--space-2)', color: stats.pendingDeals > 0 ? 'var(--color-warning)' : 'var(--color-gray-500)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
            {stats.pendingDeals} pending review
          </div>
        </div>

        <div className={styles.tableCard} style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Users</span>
            <Users size={20} />
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>8,421</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
            <ArrowUpRight size={16} /> +4% this month
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.tableCard} style={{ marginTop: 'var(--space-6)' }}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Action Required</h2>
            <p className={styles.sectionSubtitle}>Items needing immediate administrator attention.</p>
          </div>
        </div>
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {stats.pendingMerchants > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ color: 'var(--color-warning-dark)' }}><Store size={24} /></div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-gray-900)', fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{stats.pendingMerchants} Merchant Registration(s)</h3>
                  <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>New merchants are waiting to be verified.</p>
                </div>
              </div>
              <Link href="/admin/merchants" className={styles.primaryButton}>Review Merchants</Link>
            </div>
          )}

          {stats.pendingDeals > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ color: 'var(--color-warning-dark)' }}><Ticket size={24} /></div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--color-gray-900)', fontSize: 'var(--text-base)', fontWeight: 'bold' }}>{stats.pendingDeals} Deal(s) Pending Review</h3>
                  <p style={{ margin: 0, color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>Merchants have submitted new deals for approval.</p>
                </div>
              </div>
              <Link href="/admin/deals" className={styles.primaryButton}>Review Deals</Link>
            </div>
          )}

          {stats.pendingMerchants === 0 && stats.pendingDeals === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-gray-500)' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto var(--space-3)', color: 'var(--color-success)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--color-gray-900)' }}>All caught up!</h3>
              <p style={{ margin: 0 }}>No pending items require your attention right now.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Just importing this for the "All caught up" icon
import { CheckCircle2 } from "lucide-react";

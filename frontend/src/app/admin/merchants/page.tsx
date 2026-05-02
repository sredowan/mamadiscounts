"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Edit3, Plus, Trash2, XCircle, Store } from "lucide-react";
import {
  DEAL_STORE_CHANGED,
  getRegisteredMerchants,
  updateRegisteredMerchant,
  deleteRegisteredMerchant,
  type RegisteredMerchant,
} from "@/lib/deal-store";
import styles from "../../merchant/merchant.module.css";

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<RegisteredMerchant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  function refresh() {
    setMerchants(getRegisteredMerchants());
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

  function handleApprove(id: string) {
    updateRegisteredMerchant(id, { verificationStatus: "verified" });
    refresh();
  }

  function handleReject(id: string) {
    updateRegisteredMerchant(id, { verificationStatus: "rejected" });
    refresh();
  }

  function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to permanently delete this merchant?")) {
      deleteRegisteredMerchant(id);
      refresh();
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Store size={16} /> Merchants</span>
          <h1 className={styles.heroTitle}>Merchant Directory</h1>
          <p className={styles.heroText}>Review new merchant applications, manage existing accounts, and update verification statuses.</p>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Registered Merchants</h2>
            <p className={styles.sectionSubtitle}>All merchant accounts in the system.</p>
          </div>
          <Link href="/merchant/register" className={styles.secondaryButton}>
            <Plus size={16} /> Add new merchant
          </Link>
        </div>
        
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business Name & Contact</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id}>
                  <td>
                    {editingId === merchant.id ? (
                      <input 
                        className={styles.inlineInput} 
                        defaultValue={merchant.businessName} 
                        onBlur={(e) => {
                          updateRegisteredMerchant(merchant.id, { businessName: e.target.value });
                          setEditingId(null);
                          refresh();
                        }} 
                        autoFocus
                      />
                    ) : (
                      <>
                        <strong>{merchant.businessName}</strong>
                        <p className={styles.itemMeta}>{merchant.email} • {merchant.phone}</p>
                      </>
                    )}
                  </td>
                  <td>{merchant.ownerName}</td>
                  <td>{merchant.category}</td>
                  <td>{merchant.area}, {merchant.city}</td>
                  <td>
                    <span className={
                      merchant.verificationStatus === "verified" ? styles.successBadge : 
                      merchant.verificationStatus === "rejected" ? styles.dangerBadge : 
                      styles.warningBadge
                    }>
                      {merchant.verificationStatus}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionRow} style={{ marginTop: 0 }}>
                      <button 
                        className={styles.secondaryButton} 
                        type="button" 
                        onClick={() => setEditingId(editingId === merchant.id ? null : merchant.id)}
                        title="Edit Business Name"
                      >
                        <Edit3 size={15} />
                      </button>
                      
                      {merchant.verificationStatus !== "verified" && (
                        <button className={styles.secondaryButton} type="button" onClick={() => handleApprove(merchant.id)}>
                          <CheckCircle2 size={15} color="var(--color-success)" /> Approve
                        </button>
                      )}
                      
                      {merchant.verificationStatus !== "rejected" && merchant.verificationStatus !== "verified" && (
                        <button className={styles.secondaryButton} type="button" onClick={() => handleReject(merchant.id)}>
                          <XCircle size={15} /> Reject
                        </button>
                      )}
                      
                      <button className={styles.dangerButton} type="button" onClick={() => handleDelete(merchant.id)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No merchants registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

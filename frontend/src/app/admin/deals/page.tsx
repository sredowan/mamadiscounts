"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Edit3, Plus, Trash2, XCircle, Ticket, Eye, X } from "lucide-react";
import {
  DEAL_STORE_CHANGED,
  addManagedDeal,
  deleteManagedDeal,
  getManagedDeals,
  updateManagedDeal,
  type ManagedDeal,
} from "@/lib/deal-store";
import { formatBDT } from "@/lib/utils";
import styles from "../../merchant/merchant.module.css";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<ManagedDeal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDeal, setViewingDeal] = useState<ManagedDeal | null>(null);

  function refresh() {
    setDeals(getManagedDeals());
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

  function addDemoDeal() {
    addManagedDeal({
      title: "Admin Super Deal",
      categoryName: "Special",
      categorySlug: "special",
      description: "A deal created directly from the admin panel.",
      originalPrice: 5000,
      dealPrice: 2499,
      quantityTotal: 50,
      maxPerUser: 1,
      redemptionMethod: "Digital Voucher",
      validity: "Valid for 30 days",
      merchant: {
        id: "admin-system",
        businessName: "Platform Managed Deal",
        address: "HQ",
        area: "Dhaka",
        city: "Dhaka",
      },
    });
    refresh();
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Ticket size={16} /> Deals Control</span>
          <h1 className={styles.heroTitle}>Deals Management</h1>
          <p className={styles.heroText}>Review, edit, approve, or remove any deal submitted by merchants across the entire platform.</p>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>All Platform Deals</h2>
            <p className={styles.sectionSubtitle}>Manage pricing, status, and approvals.</p>
          </div>
          <button className={styles.primaryButton} type="button" onClick={addDemoDeal}>
            <Plus size={16} /> Create admin deal
          </button>
        </div>
        
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Merchant</th>
                <th>Price</th>
                <th>Review Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td>
                    {editingId === deal.id ? (
                      <input 
                        className={styles.inlineInput} 
                        defaultValue={deal.title} 
                        onBlur={(event) => {
                          updateManagedDeal(deal.id, { title: event.target.value });
                          setEditingId(null);
                        }} 
                        autoFocus
                      />
                    ) : (
                      <>
                        <strong>{deal.title}</strong>
                        <p className={styles.itemMeta}>{deal.category.name}</p>
                      </>
                    )}
                  </td>
                  <td>{deal.merchant.businessName}</td>
                  <td>
                    {editingId === deal.id ? (
                      <input 
                        className={styles.inlineInput} 
                        type="number"
                        defaultValue={deal.dealPrice} 
                        onBlur={(event) => {
                          updateManagedDeal(deal.id, { dealPrice: Number(event.target.value) || deal.dealPrice });
                        }} 
                      />
                    ) : (
                      formatBDT(deal.dealPrice)
                    )}
                  </td>
                  <td>
                    <span className={
                      deal.reviewStatus === "approved" ? styles.successBadge : 
                      deal.reviewStatus === "changes_requested" ? styles.warningBadge : 
                      styles.neutralBadge
                    }>
                      {deal.reviewStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className={deal.status === "active" ? styles.successBadge : styles.warningBadge}>
                      {deal.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionRow} style={{ marginTop: 0 }}>
                      <button 
                        className={styles.secondaryButton} 
                        type="button" 
                        onClick={() => setViewingDeal(deal)}
                      >
                        <Eye size={15} /> View
                      </button>

                      <button 
                        className={styles.secondaryButton} 
                        type="button" 
                        onClick={() => setEditingId(editingId === deal.id ? null : deal.id)}
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                      
                      {deal.reviewStatus !== "approved" && (
                        <button className={styles.secondaryButton} type="button" onClick={() => updateManagedDeal(deal.id, { reviewStatus: "approved", status: "active" })}>
                          <CheckCircle2 size={15} color="var(--color-success)" /> Approve
                        </button>
                      )}
                      
                      <button className={styles.secondaryButton} type="button" onClick={() => updateManagedDeal(deal.id, { status: deal.status === "active" ? "paused" : "active" })}>
                        {deal.status === "active" ? "Pause" : "Resume"}
                      </button>
                      
                      <button className={styles.dangerButton} type="button" onClick={() => deleteManagedDeal(deal.id)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No deals on the platform yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deal Details Modal */}
      {viewingDeal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "8px", width: "100%", maxWidth: "800px",
            maxHeight: "90vh", overflowY: "auto", position: "relative"
          }}>
            <button 
              onClick={() => setViewingDeal(null)} 
              style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", color: "black" }}
            >
              <X size={24} />
            </button>

            <div style={{ padding: "30px" }}>
              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{
                  width: "120px", height: "120px", borderRadius: "8px",
                  backgroundImage: `url(${viewingDeal.images?.[0] || "/images/placeholder.jpg"})`, backgroundSize: "cover", backgroundPosition: "center"
                }} />
                <div>
                  <h2 style={{ fontSize: "24px", margin: "0 0 10px 0", color: "black" }}>{viewingDeal.title}</h2>
                  <p style={{ color: "#666", margin: "0 0 10px 0" }}><strong>Merchant:</strong> {viewingDeal.merchant.businessName}</p>
                  <p style={{ color: "#666", margin: "0 0 10px 0" }}><strong>Category:</strong> {viewingDeal.category.name}</p>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>{formatBDT(viewingDeal.dealPrice)}</span>
                    <span style={{ textDecoration: "line-through", color: "#999" }}>{formatBDT(viewingDeal.originalPrice)}</span>
                    <span style={{ color: "green", fontWeight: "bold", fontSize: "14px" }}>{viewingDeal.discountPercent}% OFF</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "black" }}>Dates & Limits</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#555" }}>
                    <li><strong>Start:</strong> {viewingDeal.startDate}</li>
                    <li><strong>End:</strong> {viewingDeal.endDate}</li>
                    <li><strong>Total Qty:</strong> {viewingDeal.quantityTotal}</li>
                    <li><strong>Max Per User:</strong> {viewingDeal.maxPerUser}</li>
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "black" }}>Options</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#555" }}>
                    {viewingDeal.options?.map((opt, i) => (
                      <li key={i}>{opt.title}: {formatBDT(opt.dealPrice)} (was {formatBDT(opt.originalPrice)})</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "black" }}>Description</h3>
                <p style={{ color: "#555", lineHeight: 1.5, margin: 0 }}>{viewingDeal.description}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "black" }}>Highlights</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#555" }}>
                    {viewingDeal.highlights?.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "black" }}>Fine Print</h3>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: "#555" }}>
                    {viewingDeal.finePrint?.split('. ').map((f, i) => f ? <li key={i}>{f}</li> : null)}
                  </ul>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <button 
                  style={{ padding: "10px 20px", borderRadius: "6px", border: "1px solid #ddd", background: "white", cursor: "pointer", color: "black" }}
                  onClick={() => setViewingDeal(null)}
                >
                  Close
                </button>
                {viewingDeal.reviewStatus !== "approved" && (
                  <>
                    <button 
                      style={{ padding: "10px 20px", borderRadius: "6px", border: "none", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => {
                        updateManagedDeal(viewingDeal.id, { reviewStatus: "changes_requested" });
                        setViewingDeal(null);
                      }}
                    >
                      Reject / Request Changes
                    </button>
                    <button 
                      style={{ padding: "10px 20px", borderRadius: "6px", border: "none", background: "#ecfdf5", color: "#059669", cursor: "pointer", fontWeight: "bold" }}
                      onClick={() => {
                        updateManagedDeal(viewingDeal.id, { reviewStatus: "approved", status: "active" });
                        setViewingDeal(null);
                      }}
                    >
                      Approve & Publish
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

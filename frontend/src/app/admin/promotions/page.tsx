"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { CheckCircle2, Edit3, ImagePlus, Megaphone, Save, Trash2, X, XCircle } from "lucide-react";
import {
  adminGetPromotions,
  adminApprovePromotion,
  adminRejectPromotion,
  adminUpdatePayment,
  adminUpdatePromotion,
  adminDeletePromotion,
  getPromotionStatusLabel,
  SLOT_CAPACITY,
  SLOT_TIERS,
  type Promotion,
  type PromotionPaymentStatus,
  type PromotionPlacement,
  type PromotionStatus,
} from "@/lib/promotion-api";
import { normalizePromotionImage } from "@/lib/promotion-image";
import type { PromotionPlacement as ImagePromotionPlacement } from "@/lib/promotion-store";
import { formatBDT } from "@/lib/utils";
import styles from "../../merchant/merchant.module.css";

type Filter = "all" | "payment" | "review" | "approved" | "rejected";

const PROMOTION_PLANS: Record<PromotionPlacement, { label: string }> = {
  MAIN_BANNER: { label: "Slider banner" },
  SPONSORED_VOUCHER: { label: "Promoted/Sponsored voucher" },
};

function badgeClass(status: PromotionStatus, paymentStatus: PromotionPaymentStatus) {
  if (status === "REJECTED" || paymentStatus === "REJECTED") return styles.dangerBadge;
  if (status === "APPROVED" && paymentStatus === "VERIFIED") return styles.successBadge;
  return styles.warningBadge;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; linkHref: string; adminNote: string }>({ title: "", linkHref: "", adminNote: "" });

  const refresh = useCallback(async () => {
    try {
      const statusMap: Record<string, string | undefined> = {
        all: undefined,
        payment: undefined,
        review: undefined,
        approved: "APPROVED",
        rejected: "REJECTED",
      };
      const result = await adminGetPromotions({ status: statusMap[filter] });
      let filtered = result.data;

      // Client-side filter for compound statuses
      if (filter === "payment") {
        filtered = filtered.filter((p) => p.paymentStatus === "PENDING");
      } else if (filter === "review") {
        filtered = filtered.filter((p) => p.paymentStatus === "VERIFIED" && p.status === "PENDING_REVIEW");
      }

      setPromotions(filtered);
      setMessage("");
    } catch (err) {
      setPromotions([]);
      setMessage(err instanceof Error ? err.message : "Failed to load promotion requests.");
    }
  }, [filter]);

  useEffect(() => { Promise.resolve().then(refresh); }, [refresh]);

  async function handleApprove(promotion: Promotion) {
    if (promotion.paymentStatus !== "VERIFIED") {
      setMessage("Verify payment before approving this promotion.");
      return;
    }
    setLoading(true);
    const result = await adminApprovePromotion(promotion.id);
    if (result.error) setMessage(result.error);
    else setMessage("Promotion approved and scheduled for its booked slot.");
    await refresh();
    setLoading(false);
  }

  async function handleReject(promotion: Promotion) {
    const reason = prompt("Reason for rejection:", "Rejected by admin.");
    if (!reason) return;
    setLoading(true);
    const result = await adminRejectPromotion(promotion.id, reason);
    if (result.error) setMessage(result.error);
    else setMessage("Promotion rejected.");
    await refresh();
    setLoading(false);
  }

  async function handleVerifyPayment(id: string) {
    setLoading(true);
    const result = await adminUpdatePayment(id, "VERIFIED");
    if (result.error) setMessage(result.error);
    else setMessage("Payment verified.");
    await refresh();
    setLoading(false);
  }

  async function handleRejectPayment(id: string) {
    setLoading(true);
    const result = await adminUpdatePayment(id, "REJECTED");
    if (result.error) setMessage(result.error);
    else setMessage("Payment rejected.");
    await refresh();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this promotion?")) return;
    setLoading(true);
    const result = await adminDeletePromotion(id);
    if (result.error) setMessage(result.error);
    else setMessage("Promotion deleted.");
    await refresh();
    setLoading(false);
  }

  async function replaceImage(promotion: Promotion, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const placementKey: ImagePromotionPlacement = promotion.placement === "MAIN_BANNER" ? "main_banner" : "sponsored_voucher";
      const newImageUrl = await normalizePromotionImage(file, placementKey);
      const result = await adminUpdatePromotion(promotion.id, { imageUrl: newImageUrl });
      if (result.error) setMessage(result.error);
      else { setMessage("Promotion image replaced."); await refresh(); }
    } catch {
      setMessage("Could not process this replacement image.");
    }
  }

  function startEdit(promotion: Promotion) {
    setEditingId(promotion.id);
    setEditForm({
      title: promotion.title,
      linkHref: promotion.linkHref,
      adminNote: promotion.adminNote || "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    const result = await adminUpdatePromotion(editingId, {
      title: editForm.title,
      linkHref: editForm.linkHref,
      adminNote: editForm.adminNote,
    });
    if (result.error) setMessage(result.error);
    else { setMessage("Promotion updated."); setEditingId(null); }
    await refresh();
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Megaphone size={16} /> Promotion review</span>
          <h1 className={styles.heroTitle}>Paid slot requests</h1>
          <p className={styles.heroText}>Verify merchant payments, replace creatives, edit details, and approve booked slider or voucher slots.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Capacity</p>
          <p className={styles.heroPanelValue}>{SLOT_CAPACITY.MAIN_BANNER}/{SLOT_CAPACITY.SPONSORED_VOUCHER}</p>
          <p className={styles.heroPanelMeta}>banner / voucher per slot</p>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Review queue</h2>
            <p className={styles.sectionSubtitle}>Requests become public only after payment is verified and admin approves them.</p>
          </div>
        </div>

        <div className={styles.filterChips}>
          {([
            ["all", "All"],
            ["payment", "Payment pending"],
            ["review", "Ready to approve"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ] as [Filter, string][]).map(([key, label]) => (
            <button key={key} className={`${styles.filterChip} ${filter === key ? styles.filterChipActive : ""}`} onClick={() => setFilter(key)} type="button">
              {label}
            </button>
          ))}
        </div>

        {message && <p className={styles.warningBadge} style={{ marginBottom: "var(--space-4)" }}>{message}</p>}

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Creative</th>
                <th>Merchant</th>
                <th>Plan</th>
                <th>Booked slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id}>
                  <td>
                    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", minWidth: 220 }}>
                      {promotion.imageUrl && (
                        <img src={promotion.imageUrl} alt={promotion.title} style={{ width: 96, height: 60, objectFit: "cover", borderRadius: 10, border: "1px solid var(--color-gray-200)" }} />
                      )}
                      <div>
                        {editingId === promotion.id ? (
                          <input className={styles.inlineInput} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ marginBottom: 4 }} />
                        ) : (
                          <strong>{promotion.title}</strong>
                        )}
                        {editingId === promotion.id ? (
                          <input className={styles.inlineInput} value={editForm.linkHref} onChange={(e) => setEditForm({ ...editForm, linkHref: e.target.value })} placeholder="Link URL" />
                        ) : (
                          <p className={styles.itemMeta}>{promotion.linkHref}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{promotion.merchant?.businessName || "—"}</td>
                  <td>
                    <strong>{PROMOTION_PLANS[promotion.placement]?.label || promotion.placement}</strong>
                    <p className={styles.itemMeta}>{formatBDT(Number(promotion.price))}</p>
                  </td>
                  <td>
                    <div>
                      <strong>{promotion.slotDate.split("T")[0]} · {SLOT_TIERS[promotion.slotTier]?.label || promotion.slotTier}</strong>
                      <p className={styles.itemMeta}>
                        {SLOT_TIERS[promotion.slotTier]?.startHour}:00 – {SLOT_TIERS[promotion.slotTier]?.endHour === 24 ? "12 AM" : `${SLOT_TIERS[promotion.slotTier]?.endHour}:00`}
                      </p>
                    </div>
                  </td>
                  <td>
                    <span className={badgeClass(promotion.status, promotion.paymentStatus)}>{getPromotionStatusLabel(promotion)}</span>
                    <p className={styles.itemMeta}>Payment: {promotion.paymentStatus}</p>
                    {promotion.adminNote && <p className={styles.itemMeta} style={{ fontStyle: "italic" }}>Note: {promotion.adminNote}</p>}
                    {editingId === promotion.id && (
                      <textarea
                        className={styles.inlineInput}
                        value={editForm.adminNote}
                        onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                        placeholder="Admin note..."
                        rows={2}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </td>
                  <td>
                    <div className={styles.actionRow} style={{ marginTop: 0, alignItems: "center" }}>
                      {editingId === promotion.id ? (
                        <>
                          <button className={styles.primaryButton} type="button" onClick={saveEdit} disabled={loading}>
                            <Save size={15} /> Save
                          </button>
                          <button className={styles.secondaryButton} type="button" onClick={() => setEditingId(null)}>
                            <X size={15} /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {promotion.paymentStatus !== "VERIFIED" && promotion.paymentStatus !== "REJECTED" && (
                            <>
                              <button className={styles.secondaryButton} type="button" onClick={() => handleVerifyPayment(promotion.id)} disabled={loading}>
                                <CheckCircle2 size={15} /> Verify pay
                              </button>
                              <button className={styles.dangerButton} type="button" onClick={() => handleRejectPayment(promotion.id)} disabled={loading}>
                                <XCircle size={15} /> Reject pay
                              </button>
                            </>
                          )}
                          {promotion.paymentStatus === "VERIFIED" && promotion.status !== "APPROVED" && promotion.status !== "REJECTED" && (
                            <button className={styles.secondaryButton} type="button" onClick={() => handleApprove(promotion)} disabled={loading}>
                              <CheckCircle2 size={15} /> Approve
                            </button>
                          )}
                          <button className={styles.secondaryButton} type="button" onClick={() => startEdit(promotion)}>
                            <Edit3 size={15} /> Edit
                          </button>
                          <label className={styles.secondaryButton} style={{ cursor: "pointer" }}>
                            <ImagePlus size={15} /> Image
                            <input type="file" accept="image/*" onChange={(e) => replaceImage(promotion, e)} style={{ display: "none" }} />
                          </label>
                          {promotion.status !== "REJECTED" && (
                            <button className={styles.dangerButton} type="button" onClick={() => handleReject(promotion)} disabled={loading}>
                              <XCircle size={15} /> Reject
                            </button>
                          )}
                          <button className={styles.dangerButton} type="button" onClick={() => handleDelete(promotion.id)} disabled={loading}>
                            <Trash2 size={15} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "var(--space-6)", color: "var(--color-gray-500)" }}>
                    No promotion requests match this filter.
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

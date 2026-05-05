"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, Edit3, ImagePlus, Megaphone, ReceiptText, Sparkles, Trash2, X } from "lucide-react";
import { getMarketplaceDeals } from "@/lib/deal-store";
import {
  createPromotion,
  deletePromotion,
  getMyPromotions,
  getSlotAvailability,
  getPromotionStatusLabel,
  updatePromotion,
  SLOT_CAPACITY,
  SLOT_PRICES,
  SLOT_TIERS,
  type Promotion,
  type PromotionLinkType,
  type PromotionPlacement,
  type PromotionSlotTier,
  type SlotAvailability,
} from "@/lib/promotion-api";
import { getPromotionImageSizeLabel, normalizePromotionImage } from "@/lib/promotion-image";
import type { PromotionPlacement as ImagePromotionPlacement } from "@/lib/promotion-store";
import { formatBDT, slugify } from "@/lib/utils";
import type { Deal } from "@/types";
import styles from "../merchant.module.css";

const DEFAULT_MERCHANT = { id: "demo-merchant-serenity-spa", name: "Serenity Spa" };

function getMerchantSession() {
  if (typeof window === "undefined") return DEFAULT_MERCHANT;
  const session = localStorage.getItem("couponus_user");
  if (!session) return DEFAULT_MERCHANT;
  try {
    const parsed = JSON.parse(session) as { id?: string; fullName?: string };
    return { id: parsed.id || DEFAULT_MERCHANT.id, name: parsed.fullName || DEFAULT_MERCHANT.name };
  } catch {
    return DEFAULT_MERCHANT;
  }
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function MerchantPromotionsPage() {
  const merchant = getMerchantSession();
  const [placement, setPlacement] = useState<PromotionPlacement>("MAIN_BANNER");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkType, setLinkType] = useState<PromotionLinkType>("SHOP");
  const [customLink, setCustomLink] = useState("");
  const [selectedDealHref, setSelectedDealHref] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedTiers, setSelectedTiers] = useState<PromotionSlotTier[]>([]);
  const [message, setMessage] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = useCallback(async function refresh() {
    try {
      const [myPromos, marketDeals] = await Promise.all([getMyPromotions(), Promise.resolve(getMarketplaceDeals())]);
      setPromotions(myPromos);
      setDeals(marketDeals);
    } catch {
      // Fallback: load from localStorage for demo mode
      setDeals(getMarketplaceDeals());
    }
  }, []);

  // Fetch slot availability when date or placement changes
  useEffect(() => {
    async function fetchSlots() {
      const available = await getSlotAvailability(selectedDate, placement);
      setSlots(available);
    }
    fetchSlots();
  }, [selectedDate, placement]);

  useEffect(() => { Promise.resolve().then(refresh); }, [refresh]);

  const price = selectedTiers.reduce((sum, tier) => sum + SLOT_PRICES[tier][placement], 0);

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const placementKey: ImagePromotionPlacement = placement === "MAIN_BANNER" ? "main_banner" : "sponsored_voucher";
      setMessage("Preparing image for the selected promotion slot...");
      setImageUrl(await normalizePromotionImage(file, placementKey));
      setMessage(`Image fitted to ${getPromotionImageSizeLabel(placementKey)}.`);
    } catch {
      setMessage("Could not process this image. Try another image file.");
    }
  }

  function resolveLinkHref() {
    if (linkType === "SHOP") return `/brands/${slugify(merchant.name)}`;
    if (linkType === "DEAL") return selectedDealHref;
    return customLink;
  }

  function choosePlacement(nextPlacement: PromotionPlacement) {
    if (nextPlacement === placement) return;
    setPlacement(nextPlacement);
    setSelectedTiers([]);
    setImageUrl("");
    setMessage("Upload a new image so it can be fitted to this placement.");
  }

  // Start editing a promotion
  function startEdit(promo: Promotion) {
    setEditingId(promo.id);
    setPlacement(promo.placement);
    setTitle(promo.title);
    setImageUrl(promo.imageUrl || "");
    setLinkType(promo.linkType);
    setCustomLink(promo.linkType === "CUSTOM" ? promo.linkHref : "");
    setSelectedDealHref(promo.linkType === "DEAL" ? promo.linkHref : "");
    setSelectedDate(promo.slotDate.split("T")[0]);
    setSelectedTiers([promo.slotTier]);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setImageUrl("");
    setCustomLink("");
    setSelectedDealHref("");
    setSelectedTiers([]);
    setMessage("");
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion?")) return;
    setLoading(true);
    const result = await deletePromotion(id);
    if (result.error) setMessage(result.error);
    else setMessage("Promotion deleted.");
    await refresh();
    setLoading(false);
  }

  async function submitPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const linkHref = resolveLinkHref();

    if (!title.trim()) return setMessage("Add a promotion title before submitting.");
    if (!imageUrl) return setMessage("Upload the promotion image before submitting.");
    if (!linkHref) return setMessage("Choose where this promotion should link.");
    if (selectedTiers.length === 0) return setMessage("Choose at least one available BD time slot.");

    setLoading(true);

    if (editingId) {
      // UPDATE existing
      const result = await updatePromotion(editingId, {
        title: title.trim(),
        imageUrl,
        linkType,
        linkHref,
        slotDate: selectedDate,
        slotTier: selectedTiers[0],
      });

      if (result.error) {
        setMessage(result.error);
      } else {
        const priceDiffMsg = result.priceDiff && result.priceDiff !== 0
          ? ` Price difference: ${formatBDT(Math.abs(result.priceDiff))} (${result.priceDiff > 0 ? "additional charge" : "credit"}).`
          : "";
        setMessage(`Promotion updated successfully.${priceDiffMsg}`);
        cancelEdit();
      }
    } else {
      // CREATE new
      const result = await createPromotion({
        placement,
        title: title.trim(),
        imageUrl,
        linkType,
        linkHref,
        slotDate: selectedDate,
        slotTiers: selectedTiers,
      });

      if (result.error) {
        setMessage(result.error);
      } else {
        setTitle("");
        setImageUrl("");
        setCustomLink("");
        setSelectedDealHref("");
        setSelectedTiers([]);
        setMessage(`${result.promotions?.length || 1} promotion slot request${(result.promotions?.length || 1) > 1 ? "s" : ""} sent to admin for review.`);
      }
    }

    await refresh();
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Megaphone size={16} /> Paid promotion</span>
          <h1 className={styles.heroTitle}>Book slider and voucher slots</h1>
          <p className={styles.heroText}>Choose a date and one or more slots. Each selected slot creates its own booking record.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Capacity</p>
          <p className={styles.heroPanelValue}>{SLOT_CAPACITY.MAIN_BANNER}/{SLOT_CAPACITY.SPONSORED_VOUCHER}</p>
          <p className={styles.heroPanelMeta}><CalendarClock size={11} /> banner / voucher slots</p>
        </div>
      </section>

      <section className={styles.gridTwo}>
        <form className={styles.tableCard} onSubmit={submitPromotion}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{editingId ? "Edit promotion" : "Request promotion slot"}</h2>
              <p className={styles.sectionSubtitle}>
                {editingId ? "Update your promotion details. Date/slot changes recalculate pricing." : "Book multiple slots at once; each slot is still tracked separately."}
              </p>
            </div>
            {editingId && (
              <button type="button" className={styles.secondaryButton} onClick={cancelEdit}>
                <X size={15} /> Cancel edit
              </button>
            )}
          </div>

          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
              <button type="button" className={`${styles.templateCard} ${placement === "MAIN_BANNER" ? styles.templateSelected : ""}`} onClick={() => choosePlacement("MAIN_BANNER")} disabled={!!editingId}>
                <span className={styles.templateIcon}><Megaphone size={20} /></span>
                <strong>Slider Banner</strong>
                <span className={styles.itemMeta}>Image shown inside the homepage slider during booked BD slots.</span>
                <span className={styles.successBadge}>5 max per slot</span>
              </button>
              <button type="button" className={`${styles.templateCard} ${placement === "SPONSORED_VOUCHER" ? styles.templateSelected : ""}`} onClick={() => choosePlacement("SPONSORED_VOUCHER")} disabled={!!editingId}>
                <span className={styles.templateIcon}><Sparkles size={20} /></span>
                <strong>Promoted Voucher</strong>
                <span className={styles.itemMeta}>Image-only sponsored voucher card during booked BD slots.</span>
                <span className={styles.successBadge}>{SLOT_CAPACITY.SPONSORED_VOUCHER} max per slot</span>
              </button>
            </div>

            <label>
              <span className={styles.itemTitle}>Promotion title</span>
              <input className={styles.inlineInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekend spa slider" />
            </label>

            <label>
              <span className={styles.itemTitle}>Promotion image</span>
              <input className={styles.inlineInput} type="file" accept="image/*" onChange={handleImage} />
              <span className={styles.itemMeta}>Images are center-cropped to {getPromotionImageSizeLabel(placement === "MAIN_BANNER" ? "main_banner" : "sponsored_voucher")} for this placement.</span>
            </label>

            {imageUrl ? (
              <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--color-gray-200)", background: "var(--color-gray-50)" }}>
                <img src={imageUrl} alt="Promotion preview" style={{ display: "block", width: "100%", maxHeight: placement === "MAIN_BANNER" ? 260 : 180, objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ display: "grid", placeItems: "center", minHeight: 160, border: "1px dashed var(--color-gray-300)", borderRadius: 18, color: "var(--color-gray-500)", gap: 8 }}>
                <ImagePlus size={28} /> Upload image-only creative
              </div>
            )}

            <label>
              <span className={styles.itemTitle}>Link target</span>
              <select className={styles.inlineInput} value={linkType} onChange={(e) => setLinkType(e.target.value as PromotionLinkType)}>
                <option value="SHOP">My shop page</option>
                <option value="DEAL">Specific deal</option>
                <option value="CUSTOM">Custom URL</option>
              </select>
            </label>

            {linkType === "DEAL" && (
              <label>
                <span className={styles.itemTitle}>Choose deal</span>
                <select className={styles.inlineInput} value={selectedDealHref} onChange={(e) => setSelectedDealHref(e.target.value)}>
                  <option value="">Select a deal</option>
                  {deals.map((deal) => <option key={deal.id} value={`/deals/${deal.slug}`}>{deal.title}</option>)}
                </select>
              </label>
            )}

            {linkType === "CUSTOM" && (
              <label>
                <span className={styles.itemTitle}>Custom URL</span>
                <input className={styles.inlineInput} value={customLink} onChange={(e) => setCustomLink(e.target.value)} placeholder="/deals/luxury-thai-spa-package-gulshan" />
              </label>
            )}

            <label>
              <span className={styles.itemTitle}>Booking date (BD)</span>
              <input className={styles.inlineInput} type="date" min={todayKey()} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </label>

            {/* Slot selection — multiple selections create multiple one-slot promotion records. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-3)" }}>
              {(Object.keys(SLOT_TIERS) as PromotionSlotTier[]).map((tierId) => {
                const tier = SLOT_TIERS[tierId];
                const selected = selectedTiers.includes(tierId);
                const slotInfo = slots.find((s) => s.tier === tierId);
                const booked = slotInfo?.booked || 0;
                const capacity = SLOT_CAPACITY[placement];
                const available = booked < capacity || selected;
                const toggleTier = () => {
                  if (editingId) {
                    setSelectedTiers(selected ? [] : [tierId]);
                    return;
                  }
                  setSelectedTiers((current) => selected
                    ? current.filter((tierValue) => tierValue !== tierId)
                    : [...current, tierId]
                  );
                };
                return (
                  <button
                    key={tierId}
                    type="button"
                    disabled={!available}
                    onClick={toggleTier}
                    className={`${styles.templateCard} ${selected ? styles.templateSelected : ""}`}
                    style={{ opacity: available ? 1 : 0.45, cursor: available ? "pointer" : "not-allowed" }}
                  >
                    <strong>{tier.label}</strong>
                    <span className={styles.itemMeta}>{tier.startHour}:00 – {tier.endHour === 24 ? "12 AM" : `${tier.endHour}:00`}</span>
                    <span className={styles.successBadge}>{formatBDT(SLOT_PRICES[tierId][placement])}</span>
                    <span className={booked >= capacity && !selected ? styles.dangerBadge : styles.neutralBadge}>{booked}/{capacity} booked</span>
                  </button>
                );
              })}
            </div>

            {selectedTiers.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-4)", borderRadius: 16, background: "var(--color-primary-50)" }}>
                <div>
                  <p className={styles.itemTitle}>Total payment</p>
                  <p className={styles.itemMeta}>{selectedDate} · {selectedTiers.map((tier) => SLOT_TIERS[tier].label).join(", ")}</p>
                </div>
                <strong style={{ fontSize: "1.5rem", color: "var(--color-primary-700)" }}>{formatBDT(price)}</strong>
              </div>
            )}

            {message && <p className={styles.warningBadge}>{message}</p>}
            <button className={styles.primaryButton} type="submit" disabled={loading}>
              {loading ? "Processing..." : editingId ? (
                <><Edit3 size={16} /> Update promotion</>
              ) : (
                <><ReceiptText size={16} /> Send payment request</>
              )}
            </button>
          </div>
        </form>

        <section className={styles.tableCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>My promotion requests</h2>
              <p className={styles.sectionSubtitle}>Admin must verify payment and approve before slots appear.</p>
            </div>
          </div>

          <div className={styles.campaignList}>
            {promotions.map((promotion) => (
              <div className={styles.campaignItem} key={promotion.id}>
                <div className={styles.campaignInfo}>
                  <p className={styles.itemTitle}>{promotion.title}</p>
                  <p className={styles.itemMeta}>
                    {promotion.placement === "MAIN_BANNER" ? "Slider Banner" : "Promoted Voucher"} · {formatBDT(Number(promotion.price))}
                  </p>
                  <p className={styles.itemMeta}>
                    {promotion.slotDate.split("T")[0]} · {SLOT_TIERS[promotion.slotTier]?.label || promotion.slotTier}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span className={
                    promotion.status === "APPROVED" && promotion.paymentStatus === "VERIFIED"
                      ? styles.successBadge
                      : promotion.status === "REJECTED"
                        ? styles.dangerBadge
                        : styles.warningBadge
                  }>
                    {getPromotionStatusLabel(promotion)}
                  </span>
                  <button type="button" className={styles.secondaryButton} onClick={() => startEdit(promotion)} title="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button type="button" className={styles.dangerButton} onClick={() => handleDelete(promotion.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {promotions.length === 0 && <div style={{ padding: "var(--space-5)", textAlign: "center", color: "var(--color-gray-500)" }}>No promotion requests yet.</div>}
          </div>

          <Link href="/merchant/deals" className={styles.secondaryButton} style={{ marginTop: "var(--space-4)" }}>Pick a deal to promote</Link>
          <Link href="/merchant/promotions/templates" className={styles.primaryButton} style={{ marginTop: "var(--space-3)" }}>🎨 Design with branded templates</Link>
        </section>
      </section>
    </div>
  );
}

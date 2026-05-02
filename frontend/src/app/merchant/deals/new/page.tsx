"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Building2, Camera, Check, CheckCircle2, ChevronDown,
  Dumbbell, Film, GraduationCap, HeartPulse, Hotel, Laptop, Map, Music,
  Plane, Plus, Scissors, Search, Send, Shirt, Trash2, Utensils, X,
} from "lucide-react";
import { formatBDT, calcDiscount } from "@/lib/utils";
import { addManagedDeal } from "@/lib/deal-store";
import type { DealOptionInput } from "@/lib/deal-store";
import styles from "../../merchant.module.css";

/* ── Template Data ─────────────────────────────────── */
const TEMPLATES = [
  { id: "restaurant", title: "Restaurant", meta: "Buffet, set menu, dine-in", icon: Utensils, example: "Buy 1 Get 1 Dinner Buffet at Gulshan", fields: ["Meal type", "Guest count", "Reservation required", "Valid days and hours"] },
  { id: "beauty", title: "Spa & Salon", meta: "Service, appointment, therapist", icon: Scissors, example: "60-Min Thai Massage with Aromatherapy", fields: ["Service duration", "Appointment required", "Gender preference", "Available days"] },
  { id: "retail", title: "Retail", meta: "Products, stock, delivery", icon: Shirt, example: "Flat 35% Off Premium Panjabi Collection", fields: ["SKU or collection", "Size/color", "Stock", "Delivery or pickup"] },
  { id: "hotel", title: "Hotel", meta: "Room, nights, blackout dates", icon: Hotel, example: "1-Night Couple Staycation with Breakfast", fields: ["Room type", "Nights", "Guest capacity", "Blackout dates"] },
  { id: "movie", title: "Movies", meta: "Cinema, showtime, seats", icon: Film, example: "2 Premium Movie Tickets with Popcorn", fields: ["Cinema branch", "Movie format", "Seat class", "Showtime window"] },
  { id: "air", title: "Flights", meta: "Route, airline, baggage", icon: Plane, example: "Dhaka–Cox's Bazar Return Fare Deal", fields: ["Route", "Airline", "Travel dates", "Baggage allowance"] },
  { id: "nightlife", title: "Nightlife", meta: "Entry, events, age rules", icon: Music, example: "Weekend Couple Entry with Welcome Drinks", fields: ["Event date", "Entry type", "Age restriction", "Dress code"] },
  { id: "gym", title: "Fitness", meta: "Membership, classes, trainer", icon: Dumbbell, example: "1-Month Gym Membership + 2 PT Sessions", fields: ["Membership duration", "Access hours", "Trainer included", "Renewal rule"] },
  { id: "education", title: "Education", meta: "Course, batch, certificate", icon: GraduationCap, example: "IELTS Foundation Course with Mock Test", fields: ["Course name", "Course duration", "Certificate included", "Learning mode"] },
  { id: "online", title: "Online", meta: "Digital service, access period", icon: Laptop, example: "Website Audit and SEO Setup Package", fields: ["Service scope", "Delivery time", "Revision count", "Access period"] },
  { id: "travel", title: "Tours", meta: "Itinerary, transport, guide", icon: Map, example: "Sajek 2-Day Group Tour with Transport", fields: ["Destination", "Duration", "Transport included", "Itinerary"] },
  { id: "health", title: "Health", meta: "Doctor, test, appointment", icon: HeartPulse, example: "Full Body Checkup with Consultation", fields: ["Service/test package", "Specialty", "Appointment required", "Report delivery time"] },
  { id: "other", title: "Other", meta: "Custom setup", icon: Building2, example: "Custom Local Service Deal", fields: ["Service type", "Validity", "Booking requirement", "Custom fine print"] },
];

const EMPTY_OPTION: DealOptionInput = { title: "", originalPrice: 0, dealPrice: 0 };
const today = () => new Date().toISOString().slice(0, 10);
const plus90 = () => new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);

function filesToDataUrls(files: FileList | null) {
  if (!files) return Promise.resolve([] as string[]);
  return Promise.all(Array.from(files).map((f) => new Promise<string>((r) => { const rd = new FileReader(); rd.onload = () => r(String(rd.result || "")); rd.readAsDataURL(f); })));
}

/* ── Stepper Steps Config ──────────────────────────── */
const STEPS = [
  { label: "Deal Info", icon: "1" },
  { label: "Pricing & Details", icon: "2" },
  { label: "Media & Review", icon: "3" },
];

export default function NewMerchantDealPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState("restaurant");
  const [saving, setSaving] = useState(false);
  const [tplSearch, setTplSearch] = useState("");
  const [tplExpanded, setTplExpanded] = useState(false);
  const tpl = useMemo(() => TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0], [templateId]);

  // Filter templates by search
  const filteredTpls = useMemo(() => {
    if (!tplSearch.trim()) return TEMPLATES;
    const q = tplSearch.toLowerCase();
    return TEMPLATES.filter((t) => t.title.toLowerCase().includes(q) || t.meta.toLowerCase().includes(q));
  }, [tplSearch]);
  const VISIBLE_COUNT = 8;
  const visibleTpls = tplSearch ? filteredTpls : tplExpanded ? filteredTpls : filteredTpls.slice(0, VISIBLE_COUNT);
  const hasMore = !tplSearch && filteredTpls.length > VISIBLE_COUNT;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [limit, setLimit] = useState("");
  const [redemption, setRedemption] = useState("QR voucher");
  const [validity, setValidity] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(plus90());
  const [options, setOptions] = useState<DealOptionInput[]>([{ ...EMPTY_OPTION }]);
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [finePrint, setFinePrint] = useState<string[]>([""]);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [tplFields, setTplFields] = useState<Record<string, string>>({});

  // Computed
  const previewOriginal = options[0]?.originalPrice || 0;
  const previewDeal = options[0]?.dealPrice || 0;
  const previewDiscount = previewOriginal > 0 ? calcDiscount(previewOriginal, previewDeal) : 0;
  const displayTitle = title || tpl.example;

  // Helpers
  function updateOption(i: number, k: keyof DealOptionInput, v: string | number) {
    setOptions((p) => p.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  }
  function updateListItem(setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, v: string) {
    setter((p) => p.map((x, j) => (j === i ? v : x)));
  }

  async function handleCover(e: ChangeEvent<HTMLInputElement>) {
    setCoverPreview((await filesToDataUrls(e.target.files))[0] || "");
  }
  async function handleGallery(e: ChangeEvent<HTMLInputElement>) {
    const urls = await filesToDataUrls(e.target.files);
    setGalleryPreviews((p) => [...p, ...urls].slice(0, 6));
  }

  function handleSubmit() {
    setSaving(true);

    const catMap: Record<string, {id: string, slug: string, name: string}> = {
      restaurant: { id: "food", slug: "food-and-drink", name: "Food & Drink" },
      beauty: { id: "beauty", slug: "beauty-and-spa", name: "Beauty & Spa" },
      retail: { id: "shopping", slug: "shopping", name: "Shopping" },
      hotel: { id: "travel", slug: "travel", name: "Travel" },
      movie: { id: "movies", slug: "movie-tickets", name: "Movie Tickets" },
      air: { id: "travel", slug: "travel", name: "Travel" },
      nightlife: { id: "activities", slug: "things-to-do", name: "Activities" },
      gym: { id: "health", slug: "health-and-fitness", name: "Health & Fitness" },
      education: { id: "services", slug: "services", name: "Services" },
      online: { id: "services", slug: "services", name: "Services" },
      travel: { id: "travel", slug: "travel", name: "Travel" },
      health: { id: "health", slug: "health-and-fitness", name: "Health & Fitness" },
      other: { id: "services", slug: "services", name: "Services" },
    };
    const canonicalCat = catMap[tpl.id] || { id: "services", slug: "services", name: "Services" };

    const deal = addManagedDeal({
      title: title || tpl.example,
      categoryId: canonicalCat.id,
      categoryName: canonicalCat.name,
      categorySlug: canonicalCat.slug,
      description: description || tpl.fields.join(", "),
      originalPrice: options[0]?.originalPrice || 2000,
      dealPrice: options[0]?.dealPrice || 1399,
      quantityTotal: Number(quantity) || 100,
      maxPerUser: Number(limit) || 2,
      redemptionMethod: redemption,
      validity: validity || "Valid for 90 days",
      highlights: highlights.filter(Boolean),
      finePrint: finePrint.filter(Boolean),
      options: options.filter((o) => o.title.trim() && o.dealPrice > 0) || undefined,
      startDate,
      endDate,
      image: coverPreview,
      gallery: galleryPreviews,
    });
    setTimeout(() => router.push("/merchant/dashboard"), 600);
  }

  function canProceed() {
    if (step === 0) return true; // template always selected
    if (step === 1) return options.some((o) => o.title.trim() && o.dealPrice > 0);
    return true;
  }

  return (
    <div className={styles.page}>
      <div className={styles.wizard}>
        {/* ── Stepper ──────────────────────────── */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div
                className={`${styles.stepItem} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}
                onClick={() => i < step && setStep(i)}
              >
                <div className={styles.stepDot}>
                  {i < step ? <Check size={16} /> : s.icon}
                </div>
                <span className={styles.stepLabel}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={styles.stepLine}>
                  <div className={styles.stepLineFill} style={{ width: i < step ? "100%" : "0%" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Deal Info ─────────────────── */}
        {step === 0 && (
          <div className={styles.stepContent} key="step0">
            <div className={styles.wizardCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>What&apos;s your deal?</h2>
                  <p className={styles.sectionSubtitle}>Pick your business type, then tell us what you&apos;re offering.</p>
                </div>
              </div>

              {/* Template Search */}
              <div style={{ position: "relative", marginBottom: "var(--space-4)" }}>
                <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-gray-400)", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search business type…"
                  value={tplSearch}
                  onChange={(e) => { setTplSearch(e.target.value); setTplExpanded(true); }}
                  style={{ width: "100%", minHeight: 44, padding: "0 var(--space-4) 0 40px", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", background: "var(--color-white)", fontSize: "var(--text-sm)", outline: "none", fontFamily: "inherit", color: "var(--color-gray-900)", transition: "border-color 0.15s" }}
                />
              </div>

              {/* Template Grid */}
              <div className={styles.templateGrid}>
                {visibleTpls.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.templateCard} ${t.id === templateId ? styles.templateSelected : ""}`}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <span className={styles.templateIcon}><t.icon size={20} /></span>
                    <p className={styles.templateTitle}>{t.title}</p>
                    <p className={styles.templateMeta}>{t.meta}</p>
                  </button>
                ))}
              </div>
              {hasMore && !tplExpanded && (
                <button
                  type="button"
                  onClick={() => setTplExpanded(true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: "var(--space-3)", padding: "10px", border: "1px dashed var(--color-gray-300)", borderRadius: "var(--radius-lg)", background: "transparent", color: "var(--color-gray-500)", fontSize: "var(--text-xs)", fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                >
                  <ChevronDown size={14} /> Show {filteredTpls.length - VISIBLE_COUNT} more categories
                </button>
              )}
              {tplExpanded && filteredTpls.length > VISIBLE_COUNT && !tplSearch && (
                <button
                  type="button"
                  onClick={() => setTplExpanded(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: "var(--space-3)", padding: "10px", border: "none", background: "transparent", color: "var(--color-gray-400)", fontSize: "var(--text-xs)", fontWeight: 700, cursor: "pointer" }}
                >
                  Show less
                </button>
              )}
              {tplSearch && filteredTpls.length === 0 && (
                <p style={{ textAlign: "center", color: "var(--color-gray-400)", fontSize: "var(--text-sm)", padding: "var(--space-6) 0" }}>No categories match &quot;{tplSearch}&quot;</p>
              )}

              {/* Basic Fields */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Basic information</h2>
                    <p className={styles.sectionSubtitle}>The essentials for your marketplace listing.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label>Deal title</label>
                    <input placeholder={tpl.example} value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <textarea placeholder="What does the customer get? Be specific about the experience." value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label>Redemption method</label>
                    <select value={redemption} onChange={(e) => setRedemption(e.target.value)}>
                      <option>QR voucher</option><option>Booking required</option><option>Online redemption</option><option>Phone confirmation</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Voucher validity</label>
                    <input placeholder="Valid for 90 days" value={validity} onChange={(e) => setValidity(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Category-specific fields */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>{tpl.title} specifics</h2>
                    <p className={styles.sectionSubtitle}>Fields relevant to your business type.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  {tpl.fields.map((f) => (
                    <div className={styles.field} key={f}>
                      <label>{f}</label>
                      <input placeholder={`Enter ${f.toLowerCase()}`} value={tplFields[f] || ""} onChange={(e) => setTplFields((p) => ({ ...p, [f]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Pricing & Details ─────────── */}
        {step === 1 && (
          <div className={styles.stepContent} key="step1">
            <div className={styles.wizardCard}>
              {/* Pricing Options */}
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Pricing options</h2>
                  <p className={styles.sectionSubtitle}>Add one or more price tiers. Customers pick at checkout.</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {options.map((opt, i) => (
                  <div key={i} className={styles.optionTier}>
                    <div className={styles.optionTierHeader}>
                      <span className={styles.optionTierLabel}>Option {i + 1}</span>
                      {options.length > 1 && (
                        <button type="button" className={styles.multiRemoveBtn} onClick={() => setOptions((p) => p.filter((_, j) => j !== i))}><X size={14} /></button>
                      )}
                    </div>
                    <div className={styles.optionTierFields}>
                      <input placeholder="e.g. 60-Min Thai Massage" value={opt.title} onChange={(e) => updateOption(i, "title", e.target.value)} />
                      <input placeholder="Original ৳" type="number" value={opt.originalPrice || ""} onChange={(e) => updateOption(i, "originalPrice", Number(e.target.value))} />
                      <input placeholder="Deal ৳" type="number" value={opt.dealPrice || ""} onChange={(e) => updateOption(i, "dealPrice", Number(e.target.value))} />
                    </div>
                  </div>
                ))}
                <button type="button" className={styles.multiAddBtn} onClick={() => setOptions((p) => [...p, { ...EMPTY_OPTION }])}>
                  <Plus size={12} /> Add another tier
                </button>
              </div>

              {/* Dates + Limits */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Campaign window & limits</h2>
                    <p className={styles.sectionSubtitle}>When the deal runs and how many vouchers to sell.</p>
                  </div>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field}><label>Start date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                  <div className={styles.field}><label>End date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                  <div className={styles.field}><label>Voucher quantity cap</label><input type="number" placeholder="500" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
                  <div className={styles.field}><label>Per-customer limit</label><input type="number" placeholder="2" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>
                </div>
              </div>

              {/* Highlights */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>What&apos;s included</h2>
                    <p className={styles.sectionSubtitle}>Bullet points customers see on your deal page.</p>
                  </div>
                </div>
                <div className={styles.multiInput}>
                  {highlights.map((h, i) => (
                    <div key={i} className={styles.multiInputRow}>
                      <input placeholder={i === 0 ? "e.g. 60-min full body massage" : i === 1 ? "e.g. Aromatherapy included" : "e.g. Refreshments included"} value={h} onChange={(e) => updateListItem(setHighlights, i, e.target.value)} />
                      {highlights.length > 1 && <button type="button" className={styles.multiRemoveBtn} onClick={() => setHighlights((p) => p.filter((_, j) => j !== i))}><X size={14} /></button>}
                    </div>
                  ))}
                  <button type="button" className={styles.multiAddBtn} onClick={() => setHighlights((p) => [...p, ""])}><Plus size={12} /> Add highlight</button>
                </div>
              </div>

              {/* Fine Print */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Fine print</h2>
                    <p className={styles.sectionSubtitle}>Terms, restrictions, and conditions.</p>
                  </div>
                </div>
                <div className={styles.multiInput}>
                  {finePrint.map((f, i) => (
                    <div key={i} className={styles.multiInputRow}>
                      <input placeholder={i === 0 ? "e.g. Appointment required" : i === 1 ? "e.g. Not combinable with other offers" : "e.g. 24-hr cancellation policy"} value={f} onChange={(e) => updateListItem(setFinePrint, i, e.target.value)} />
                      {finePrint.length > 1 && <button type="button" className={styles.multiRemoveBtn} onClick={() => setFinePrint((p) => p.filter((_, j) => j !== i))}><X size={14} /></button>}
                    </div>
                  ))}
                  <button type="button" className={styles.multiAddBtn} onClick={() => setFinePrint((p) => [...p, ""])}><Plus size={12} /> Add rule</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Media & Review ───────────── */}
        {step === 2 && (
          <div className={styles.stepContent} key="step2">
            <div className={styles.wizardCard}>
              {/* Photos */}
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Deal photos</h2>
                  <p className={styles.sectionSubtitle}>A great cover image sells. Add up to 6 gallery images too.</p>
                </div>
              </div>
              <div className={styles.mediaGrid}>
                <label className={styles.uploadBox}>
                  <input type="file" accept="image/*" onChange={handleCover} />
                  <Camera size={24} />
                  <strong>{coverPreview ? "Change cover" : "Upload cover image"}</strong>
                  <span>Main image on cards &amp; detail page</span>
                </label>
                <label className={styles.uploadBox}>
                  <input type="file" accept="image/*" multiple onChange={handleGallery} />
                  <Plus size={24} />
                  <strong>Add gallery images</strong>
                  <span>{galleryPreviews.length}/6 uploaded</span>
                </label>
              </div>
              {galleryPreviews.length > 0 && (
                <div className={styles.galleryGrid}>
                  {galleryPreviews.map((url, i) => (
                    <div key={url} className={styles.galleryItem} style={{ backgroundImage: `url(${url})` }}>
                      <button type="button" onClick={() => setGalleryPreviews((p) => p.filter((_, j) => j !== i))}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Summary */}
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h2 className={styles.sectionTitle}>Review your deal</h2>
                    <p className={styles.sectionSubtitle}>Everything looks good? Submit for admin approval.</p>
                  </div>
                </div>

                {/* Preview card */}
                <div className={styles.previewCard}>
                  <div className={styles.previewImage} style={coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined}>
                    {!coverPreview && "Cover preview"}
                  </div>
                  <div className={styles.previewBody}>
                    <span className={styles.successBadge}>{tpl.title}</span>
                    <h3 className={styles.itemTitle} style={{ marginTop: "var(--space-3)" }}>{displayTitle}</h3>
                    <div className={styles.previewPrice}>
                      <strong>{previewDeal > 0 ? formatBDT(previewDeal) : "—"}</strong>
                      {previewOriginal > 0 && <span>{formatBDT(previewOriginal)}</span>}
                      {previewDiscount > 0 && (
                        <span style={{ marginLeft: "auto", color: "var(--color-discount)", fontWeight: 700, fontSize: "var(--text-xs)" }}>
                          {previewDiscount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary details */}
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryRow}><span className={styles.summaryLabel}>Category</span><span className={styles.summaryValue}>{tpl.title}</span></div>
                  <div className={styles.summaryRow}><span className={styles.summaryLabel}>Campaign</span><span className={styles.summaryValue}>{startDate} → {endDate}</span></div>
                  <div className={styles.summaryRow}><span className={styles.summaryLabel}>Options</span><span className={styles.summaryValue}>{options.filter((o) => o.title).length} tier{options.filter((o) => o.title).length !== 1 ? "s" : ""}</span></div>
                  <div className={styles.summaryRow}><span className={styles.summaryLabel}>Qty cap</span><span className={styles.summaryValue}>{quantity || "100"}</span></div>
                  <div className={styles.summaryRow}><span className={styles.summaryLabel}>Redemption</span><span className={styles.summaryValue}>{redemption}</span></div>
                </div>

                {highlights.filter(Boolean).length > 0 && (
                  <div className={styles.summaryChips}>
                    {highlights.filter(Boolean).map((h, i) => (
                      <span key={i} className={styles.summaryChip}><CheckCircle2 size={11} /> {h}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Wizard Footer ────────────────────── */}
        <div className={styles.wizardFooter}>
          <div>
            {step > 0 && (
              <button type="button" className={styles.wizardBackBtn} onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
          </div>
          <div className={styles.wizardFooterRight}>
            {step < 2 ? (
              <button type="button" className={styles.wizardNextBtn} onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className={styles.wizardNextBtn} onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting…" : <><Send size={16} /> Submit for approval</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

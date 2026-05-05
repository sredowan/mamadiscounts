"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft, BadgeCheck, Calendar, CheckCircle2, Clock, Copy, Download,
  Layers, MapPin, Plus, Printer, QrCode, Tag, Ticket, User,
} from "lucide-react";
import styles from "../../merchant.module.css";
import vStyles from "./create.module.css";

type Mode = "single" | "bulk";

interface GeneratedVoucher {
  code: string;
  refId: string;
  otp: string;
  qrDataUrl: string;
  customerName?: string;
  customerPhone?: string;
  dealTitle: string;
  dealPrice: string;
  dealOriginalPrice: string;
  dealDiscount: string;
  merchantName: string;
  merchantArea: string;
  validUntil: string;
  createdAt: string;
  createdBy: string;
}

interface VoucherBatch {
  id: string;
  dealTitle: string;
  count: number;
  createdAt: string;
  createdBy: string;
  vouchers: { code: string; refId: string; otp: string; customerName?: string; customerPhone?: string; dealTitle: string; createdAt: string; }[];
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg1 = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const seg2 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CPB-${seg1}-${seg2}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateRefId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `CPB-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
}

const DEMO_DEALS = [
  { id: "d1", title: "Luxury Thai Spa Package", option: "60-Min Thai Massage", price: "৳2,499", original: "৳4,999", discount: "50%", validDays: 30 },
  { id: "d2", title: "Luxury Thai Spa Package", option: "90-Min Royal Package", price: "৳3,999", original: "৳7,999", discount: "50%", validDays: 30 },
  { id: "d3", title: "Couple Relaxation Voucher", option: "Full Day Spa Access", price: "৳5,499", original: "৳9,999", discount: "45%", validDays: 60 },
];

const MERCHANT_NAME = "Serenity Thai Spa";
const MERCHANT_AREA = "Gulshan 1, Dhaka";

const STORAGE_KEY = "cpb_voucher_batches";

function loadBatches(): VoucherBatch[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveBatches(batches: VoucherBatch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
}

async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: "#1e293b", light: "#ffffff" } });
}

export default function CreateVouchersPage() {
  const [mode, setMode] = useState<Mode>("single");
  const [dealId, setDealId] = useState(DEMO_DEALS[0].id);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bulkQty, setBulkQty] = useState(10);
  const [generated, setGenerated] = useState<GeneratedVoucher[]>([]);
  const [batches, setBatches] = useState<VoucherBatch[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState("#10b981");
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setBatches(loadBatches());
      const color = localStorage.getItem("cpb_merchant_brand_color");
      if (color) setBrandColor(color);
    });
  }, []);

  const selectedDeal = DEMO_DEALS.find((d) => d.id === dealId);

  async function createVouchers(qty: number) {
    if (!selectedDeal) return;
    setGenerating(true);
    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + selectedDeal.validDays * 86400000).toLocaleDateString("en-BD", { dateStyle: "long" });

    const vouchers: GeneratedVoucher[] = [];
    for (let i = 0; i < qty; i++) {
      const refId = generateRefId();
      const code = generateCode();
      const qrPayload = `https://couponusbd.com/redeem/${refId}`;
      const qrDataUrl = await generateQrDataUrl(qrPayload);
      vouchers.push({
        code,
        refId,
        otp: generateOtp(),
        qrDataUrl,
        customerName: qty === 1 && customerName ? customerName : undefined,
        customerPhone: qty === 1 && customerPhone ? customerPhone : undefined,
        dealTitle: `${selectedDeal.title} — ${selectedDeal.option}`,
        dealPrice: selectedDeal.price,
        dealOriginalPrice: selectedDeal.original,
        dealDiscount: selectedDeal.discount,
        merchantName: MERCHANT_NAME,
        merchantArea: MERCHANT_AREA,
        validUntil,
        createdAt: now,
        createdBy: "Spa Owner",
      });
    }
    setGenerated(vouchers);
    setGenerating(false);

    const batchVouchers = vouchers.map((v) => ({
      code: v.code, refId: v.refId, otp: v.otp,
      customerName: v.customerName, customerPhone: v.customerPhone,
      dealTitle: v.dealTitle, createdAt: v.createdAt,
    }));
    const batch: VoucherBatch = {
      id: `batch_${Date.now()}`,
      dealTitle: `${selectedDeal.title} — ${selectedDeal.option}`,
      count: qty,
      createdAt: now,
      createdBy: "Spa Owner",
      vouchers: batchVouchers,
    };
    const updated = [batch, ...batches].slice(0, 50);
    setBatches(updated);
    saveBatches(updated);
  }

  function copyCode(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  async function downloadPdf() {
    if (!printRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;
    const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`vouchers_${MERCHANT_NAME.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <section className={styles.hero}>
        <div>
          <Link href="/merchant/vouchers" className={vStyles.backLink}><ArrowLeft size={16} /> Back to vouchers</Link>
          <h1 className={styles.heroTitle}>Create vouchers</h1>
          <p className={styles.heroText}>Generate branded vouchers with scannable QR codes for physical redemption.</p>
        </div>
      </section>

      {/* Mode Toggle */}
      <div className={vStyles.modeToggle}>
        <button className={`${vStyles.modeBtn} ${mode === "single" ? vStyles.modeBtnActive : ""}`} onClick={() => { setMode("single"); setGenerated([]); }} type="button">
          <Ticket size={16} /> Single voucher
        </button>
        <button className={`${vStyles.modeBtn} ${mode === "bulk" ? vStyles.modeBtnActive : ""}`} onClick={() => { setMode("bulk"); setGenerated([]); }} type="button">
          <Layers size={16} /> Bulk create
        </button>
      </div>

      {/* Form */}
      <section className={vStyles.formCard}>
        <div className={vStyles.formHeader}>
          <h2 className={vStyles.formTitle}>{mode === "single" ? "Single voucher" : "Bulk voucher generation"}</h2>
          <p className={vStyles.formSub}>{mode === "single" ? "Create one voucher with optional customer assignment." : "Generate multiple unassigned vouchers for print and physical distribution."}</p>
        </div>

        <div className={vStyles.fieldGroup}>
          <label className={vStyles.label} htmlFor="dealSelect">Select deal / package</label>
          <select id="dealSelect" className={vStyles.select} value={dealId} onChange={(e) => setDealId(e.target.value)}>
            {DEMO_DEALS.map((d) => (<option key={d.id} value={d.id}>{d.title} — {d.option} ({d.price})</option>))}
          </select>
        </div>

        {selectedDeal && (
          <div className={vStyles.dealPreview}>
            <div className={vStyles.dealPreviewLeft}>
              <Tag size={14} /> <strong>{selectedDeal.title}</strong>
              <span className={vStyles.dealOption}>{selectedDeal.option}</span>
            </div>
            <div className={vStyles.dealPreviewRight}>
              <span className={vStyles.dealPreviewPrice}>{selectedDeal.price}</span>
              <span className={vStyles.dealPreviewOriginal}>{selectedDeal.original}</span>
              <span className={vStyles.dealPreviewDiscount}>{selectedDeal.discount} OFF</span>
            </div>
          </div>
        )}

        {mode === "single" && (
          <>
            <div className={vStyles.fieldRow}>
              <div className={vStyles.fieldGroup}>
                <label className={vStyles.label} htmlFor="custName">Customer name <span className={vStyles.optional}>(optional)</span></label>
                <input id="custName" className={vStyles.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Rahim Islam" />
              </div>
              <div className={vStyles.fieldGroup}>
                <label className={vStyles.label} htmlFor="custPhone">Phone <span className={vStyles.optional}>(optional)</span></label>
                <input id="custPhone" className={vStyles.input} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01700-000000" inputMode="tel" />
              </div>
            </div>
            <button className={vStyles.createBtn} type="button" onClick={() => createVouchers(1)} disabled={generating}>
              <Plus size={18} /> {generating ? "Generating..." : "Generate voucher"}
            </button>
          </>
        )}

        {mode === "bulk" && (
          <>
            <div className={vStyles.fieldGroup}>
              <label className={vStyles.label} htmlFor="bulkQty">Number of vouchers</label>
              <div className={vStyles.qtyRow}>
                {[5, 10, 25, 50, 100].map((n) => (
                  <button key={n} className={`${vStyles.qtyChip} ${bulkQty === n ? vStyles.qtyChipActive : ""}`} onClick={() => setBulkQty(n)} type="button">{n}</button>
                ))}
                <input id="bulkQty" className={vStyles.qtyInput} type="number" min={1} max={500} value={bulkQty} onChange={(e) => setBulkQty(Math.max(1, Math.min(500, Number(e.target.value))))} />
              </div>
            </div>
            <button className={vStyles.createBtn} type="button" onClick={() => createVouchers(bulkQty)} disabled={generating}>
              <Layers size={18} /> {generating ? "Generating..." : `Generate ${bulkQty} vouchers`}
            </button>
          </>
        )}
      </section>

      {/* ── Generated Vouchers — Branded Brochure ──────── */}
      {generated.length > 0 && (
        <section className={vStyles.resultsSection}>
          <div className={vStyles.resultsHeader}>
            <div>
              <h2 className={vStyles.formTitle}>
                <CheckCircle2 size={20} style={{ color: brandColor, verticalAlign: "-3px" }} /> {generated.length} voucher{generated.length > 1 ? "s" : ""} created
              </h2>
              <p className={vStyles.formSub}>For: {selectedDeal?.title} — {selectedDeal?.option}</p>
              <p className={vStyles.formSub} style={{ fontSize: "0.65rem", marginTop: 2 }}>
                <Clock size={10} style={{ display: "inline", verticalAlign: "-1px" }} /> {formatDate(generated[0].createdAt)} · by {generated[0].createdBy}
              </p>
            </div>
            <div className={vStyles.resultsActions}>
              <button className={vStyles.actionBtn} type="button" onClick={() => window.print()}><Printer size={15} /> Print</button>
              <button className={vStyles.actionBtn} type="button" onClick={downloadPdf}><Download size={15} /> Download PDF</button>
            </div>
          </div>

          <div ref={printRef} className={vStyles.voucherGrid}>
            {generated.map((v, i) => (
              <div className={vStyles.brochure} key={v.code}>
                {/* Branded Header */}
                <div className={vStyles.brochureHeader} style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}>
                  <div className={vStyles.brochureHeaderLeft}>
                    <div className={vStyles.brochureLogo} style={{ background: "rgba(255,255,255,0.2)" }}>
                      {v.merchantName.charAt(0)}
                    </div>
                    <div>
                      <p className={vStyles.brochureMerchant}>{v.merchantName}</p>
                      <p className={vStyles.brochureLocation}><MapPin size={9} /> {v.merchantArea}</p>
                    </div>
                  </div>
                  <div className={vStyles.brochureBadge}><BadgeCheck size={10} /> Verified</div>
                </div>

                {/* Deal Info */}
                <div className={vStyles.brochureBody}>
                  <p className={vStyles.brochureDealTitle}>{v.dealTitle}</p>
                  <div className={vStyles.brochurePricing}>
                    <span className={vStyles.brochurePrice}>{v.dealPrice}</span>
                    <span className={vStyles.brochureOriginal}>{v.dealOriginalPrice}</span>
                    <span className={vStyles.brochureDiscount} style={{ background: `${brandColor}15`, color: brandColor }}>{v.dealDiscount} OFF</span>
                  </div>

                  {v.customerName && (
                    <div className={vStyles.brochureCustomer}>
                      <User size={11} /> {v.customerName} {v.customerPhone && `· ${v.customerPhone}`}
                    </div>
                  )}

                  {/* QR + Ref Section */}
                  <div className={vStyles.brochureQrSection}>
                    <div className={vStyles.brochureQrWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.qrDataUrl} alt={`QR ${v.refId}`} className={vStyles.brochureQrImg} />
                    </div>
                    <div className={vStyles.brochureRefWrap}>
                      <p className={vStyles.brochureRefLabel}>REFERENCE ID</p>
                      <p className={vStyles.brochureRefCode}>{v.refId}</p>
                      <button className={vStyles.copyBtn} type="button" onClick={() => copyCode(v.refId, `ref-${i}`)}>
                        {copied === `ref-${i}` ? <CheckCircle2 size={11} /> : <Copy size={11} />} {copied === `ref-${i}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className={vStyles.brochureFooter}>
                    <div className={vStyles.brochureFooterItem}>
                      <Calendar size={10} /> Valid until {v.validUntil}
                    </div>
                    <div className={vStyles.brochureFooterItem}>
                      <QrCode size={10} /> Scan or show ref to redeem
                    </div>
                  </div>

                  <div className={vStyles.brochurePowered}>
                    Powered by <strong>Couponus BD</strong>
                  </div>
                </div>
                <span className={vStyles.brochureNum}>#{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Creation History */}
      {batches.length > 0 && (
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Creation history</h2>
              <p className={styles.sectionSubtitle}>Track record of all voucher batches.</p>
            </div>
          </div>
          <div className={styles.mobileCardList} style={{ display: "flex" }}>
            {batches.map((b) => (
              <div className={styles.mobileCard} key={b.id}>
                <div className={styles.mobileCardHead}>
                  <div>
                    <p className={styles.itemTitle}>{b.count} voucher{b.count > 1 ? "s" : ""}</p>
                    <p className={styles.itemMeta}>{b.dealTitle}</p>
                  </div>
                  <span className={styles.neutralBadge}>{b.count > 1 ? "Bulk" : "Single"}</span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}><Calendar size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> Created</span>
                  <span className={styles.mobileCardValue}>{formatDate(b.createdAt)}</span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}><User size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> By</span>
                  <span className={styles.mobileCardValue}>{b.createdBy}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

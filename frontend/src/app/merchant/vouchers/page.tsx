"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  Camera, CameraOff, CheckCircle2, CircleAlert, Hash, KeyRound,
  Phone, Plus, QrCode, Search, Ticket, User, X,
} from "lucide-react";
import styles from "../merchant.module.css";
import vStyles from "./vouchers.module.css";

type VerifyTab = "qr" | "otp" | "phone" | "refid";

interface VoucherEntry {
  code: string;
  otp: string;
  refId: string;
  customer: string;
  phone: string;
  deal: string;
  option: string;
  status: string;
  time: string;
}

const DEMO_VOUCHERS: VoucherEntry[] = [
  { code: "CPB-A7F3BC-M2K9X", otp: "482916", refId: "CPB-A7F3BC", customer: "Rahim Islam", phone: "01700000000", deal: "Luxury Thai Spa Package", option: "60-Min Thai Massage", status: "Valid", time: "Today, 2:12 PM" },
  { code: "CPB-KL9M2N-P3Q4R", otp: "739251", refId: "CPB-KL9M2N", customer: "Sadia Rahman", phone: "01700000000", deal: "Couple Relaxation Voucher", option: "90-Min Royal Package", status: "Redeemed", time: "Today, 10:45 AM" },
  { code: "CPB-XYZ123-ABCDE", otp: "195374", refId: "CPB-XYZ123", customer: "Kamrul Hasan", phone: "01811222333", deal: "90-Min Royal Package", option: "90-Min Royal Package", status: "Expired", time: "Apr 15, 2:00 PM" },
  { code: "CPB-MNOP45-FGHIJ", otp: "627483", refId: "CPB-MNOP45", customer: "Rahim Islam", phone: "01700000000", deal: "90-Min Royal Package", option: "90-Min Royal Package", status: "Valid", time: "Today, 3:30 PM" },
];

const VERIFY_TABS: { key: VerifyTab; label: string; icon: typeof QrCode; desc: string }[] = [
  { key: "qr", label: "QR Scan", icon: Camera, desc: "Scan printed or on-screen QR" },
  { key: "otp", label: "OTP", icon: KeyRound, desc: "Customer tells 6-digit code" },
  { key: "phone", label: "Phone", icon: Phone, desc: "Look up by phone number" },
  { key: "refid", label: "Ref ID", icon: Hash, desc: "Enter reference code" },
];

/** Load created vouchers from localStorage and normalize to VoucherEntry[] */
function loadCreatedVouchers(): VoucherEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cpb_voucher_batches");
    if (!raw) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batches: any[] = JSON.parse(raw);
    const entries: VoucherEntry[] = [];
    for (const batch of batches) {
      if (!batch.vouchers) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const v of batch.vouchers as any[]) {
        entries.push({
          code: v.code,
          otp: v.otp,
          refId: v.refId,
          customer: v.customerName || "Walk-in customer",
          phone: v.customerPhone || "",
          deal: v.dealTitle?.split(" — ")[0] || batch.dealTitle?.split(" — ")[0] || "Deal",
          option: v.dealTitle?.split(" — ")[1] || batch.dealTitle?.split(" — ")[1] || "",
          status: "Valid",
          time: new Date(v.createdAt || batch.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" }),
        });
      }
    }
    return entries;
  } catch { return []; }
}

export default function MerchantVouchersPage() {
  const [verifyTab, setVerifyTab] = useState<VerifyTab>("otp");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [refInput, setRefInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [searchResult, setSearchResult] = useState<VoucherEntry[] | null>(null);
  const [singleResult, setSingleResult] = useState<VoucherEntry | "not_found" | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [allVouchers, setAllVouchers] = useState<VoucherEntry[]>(DEMO_VOUCHERS);
  const scannerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerInstanceRef = useRef<any>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load created vouchers from localStorage on mount
  useEffect(() => {
    const created = loadCreatedVouchers();
    setAllVouchers([...created, ...DEMO_VOUCHERS]);
  }, []);

  // ── OTP input handler ──
  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      e.preventDefault();
      const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
      setOtpDigits(next);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  // ── QR Scanner ──
  const startScanner = useCallback(async () => {
    setScanning(true);
    setScanResult("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerInstanceRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          setScanResult(decodedText);
          scanner.stop().catch(() => {});
          scannerInstanceRef.current = null;
          setScanning(false);
          // Extract ref from URL like couponusbd.com/redeem/CPB-XXXXXX
          const refFromUrl = decodedText.match(/redeem\/(CPB-[A-Z0-9]+)/)?.[1];
          const searchText = refFromUrl || decodedText;
          const found = allVouchers.find(
            (v) => v.code === searchText || v.refId === searchText || v.code === decodedText || v.refId === decodedText
          );
          setSingleResult(found || "not_found");
          setSearchResult(null);
        },
        () => {},
      );
    } catch {
      setScanning(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVouchers]);

  function stopScanner() {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {});
      scannerInstanceRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search handlers ──
  function searchByOtp(e: FormEvent) {
    e.preventDefault();
    const otp = otpDigits.join("");
    const found = allVouchers.find((v) => v.otp === otp);
    setSingleResult(found || "not_found");
    setSearchResult(null);
  }

  function searchByRef(e: FormEvent) {
    e.preventDefault();
    const input = refInput.trim().toUpperCase();
    const found = allVouchers.find(
      (v) => v.refId.toUpperCase() === input || v.code.toUpperCase() === input
    );
    setSingleResult(found || "not_found");
    setSearchResult(null);
  }

  function searchByPhone(e: FormEvent) {
    e.preventDefault();
    const phone = phoneInput.trim().replace(/\D/g, "");
    const found = allVouchers.filter((v) => v.phone && v.phone.includes(phone));
    setSearchResult(found.length > 0 ? found : null);
    setSingleResult(found.length === 0 ? "not_found" : null);
  }

  function redeemVoucher(code: string) {
    setRedeemed((prev) => new Set(prev).add(code));
  }

  function isRedeemed(v: VoucherEntry) {
    return v.status === "Redeemed" || redeemed.has(v.code);
  }

  function resetResults() {
    setSingleResult(null);
    setSearchResult(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setRefInput("");
    setPhoneInput("");
    setScanResult("");
    stopScanner();
  }

  function renderVoucherResult(v: VoucherEntry) {
    const done = isRedeemed(v);
    return (
      <div className={vStyles.resultCard} key={v.code}>
        <div className={vStyles.resultTop}>
          <div className={vStyles.resultInfo}>
            <span className={done ? styles.neutralBadge : v.status === "Expired" ? styles.dangerBadge : styles.successBadge}>
              {done ? "✓ Redeemed" : v.status === "Expired" ? "Expired" : "✓ Valid"}
            </span>
            <p className={vStyles.resultDeal}>{v.deal}</p>
            <p className={vStyles.resultOption}>{v.option}</p>
          </div>
          <div className={vStyles.resultMeta}>
            <p className={vStyles.resultCustomer}><User size={11} /> {v.customer}</p>
            <p className={vStyles.resultCode}>{v.refId}</p>
            <p className={vStyles.resultOtp}>OTP: <strong>{v.otp}</strong></p>
          </div>
        </div>
        {!done && v.status === "Valid" && (
          <button className={vStyles.redeemBtn} type="button" onClick={() => redeemVoucher(v.code)}>
            <CheckCircle2 size={16} /> Confirm redemption
          </button>
        )}
      </div>
    );
  }

  const otpFull = otpDigits.every((d) => d !== "");

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><QrCode size={16} /> Voucher redemption</span>
          <h1 className={styles.heroTitle}>Verify &amp; redeem</h1>
          <p className={styles.heroText}>Search by OTP, phone, QR scan, or reference ID.</p>
          <Link href="/merchant/vouchers/create" className={vStyles.createLink}>
            <Plus size={16} /> Create vouchers
          </Link>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Today redeemed</p>
          <p className={styles.heroPanelValue}>{11 + redeemed.size}</p>
          <p className={styles.heroPanelMeta}>0 disputed</p>
        </div>
      </section>

      {/* Method Selector — Card Grid */}
      <div className={vStyles.methodGrid}>
        {VERIFY_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${vStyles.methodCard} ${verifyTab === tab.key ? vStyles.methodCardActive : ""}`}
            onClick={() => { setVerifyTab(tab.key); resetResults(); }}
            type="button"
          >
            <span className={vStyles.methodIcon}><tab.icon size={20} /></span>
            <span className={vStyles.methodLabel}>{tab.label}</span>
            <span className={vStyles.methodDesc}>{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Verification Panel */}
      <section className={vStyles.verifyPanel}>
        {/* ── QR Scanner ── */}
        {verifyTab === "qr" && (
          <div className={vStyles.scannerWrap}>
            <div className={vStyles.scannerHeader}>
              <h2 className={vStyles.panelTitle}>Scan QR Code</h2>
              <p className={vStyles.panelSub}>Point your camera at the customer&apos;s printed or on-screen QR voucher</p>
            </div>
            {!scanning ? (
              <div className={vStyles.scannerPlaceholder}>
                <div className={vStyles.scannerFrame}>
                  <Camera size={48} />
                  <p>Camera is off</p>
                </div>
                <button className={vStyles.scanBtn} type="button" onClick={startScanner}>
                  <Camera size={18} /> Start camera scanner
                </button>
              </div>
            ) : (
              <div className={vStyles.scannerActive}>
                <div id="qr-reader" ref={scannerRef} className={vStyles.scannerView} />
                <button className={vStyles.stopBtn} type="button" onClick={stopScanner}>
                  <CameraOff size={16} /> Stop scanner
                </button>
              </div>
            )}
            {scanResult && (
              <div className={vStyles.scanResultBar}>
                <CheckCircle2 size={16} /> Scanned: <code>{scanResult}</code>
              </div>
            )}
          </div>
        )}

        {/* ── OTP ── */}
        {verifyTab === "otp" && (
          <form onSubmit={searchByOtp} className={vStyles.otpWrap}>
            <div className={vStyles.scannerHeader}>
              <h2 className={vStyles.panelTitle}>Enter OTP</h2>
              <p className={vStyles.panelSub}>Ask the customer for their 6-digit one-time password</p>
            </div>
            <div className={vStyles.otpBoxes} onPaste={handleOtpPaste}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className={vStyles.otpBox}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button className={vStyles.verifyBtn} type="submit" disabled={!otpFull}>
              <Search size={16} /> Verify OTP
            </button>
          </form>
        )}

        {/* ── Phone Lookup ── */}
        {verifyTab === "phone" && (
          <form onSubmit={searchByPhone} className={vStyles.otpWrap}>
            <div className={vStyles.scannerHeader}>
              <h2 className={vStyles.panelTitle}>Phone Lookup</h2>
              <p className={vStyles.panelSub}>Enter the customer&apos;s registered phone number to find all their vouchers</p>
            </div>
            <div className={vStyles.phoneField}>
              <span className={vStyles.phonePrefix}>+880</span>
              <input
                className={vStyles.phoneInput}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="1700000000"
                inputMode="tel"
              />
            </div>
            <button className={vStyles.verifyBtn} type="submit" disabled={phoneInput.replace(/\D/g, "").length < 5}>
              <Search size={16} /> Find vouchers
            </button>
          </form>
        )}

        {/* ── Ref ID ── */}
        {verifyTab === "refid" && (
          <form onSubmit={searchByRef} className={vStyles.otpWrap}>
            <div className={vStyles.scannerHeader}>
              <h2 className={vStyles.panelTitle}>Reference ID</h2>
              <p className={vStyles.panelSub}>Enter the voucher reference code printed on receipt or shown on phone</p>
            </div>
            <input
              className={vStyles.refInput}
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder="CPB-A7F3BC"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            <button className={vStyles.verifyBtn} type="submit" disabled={refInput.trim().length < 5}>
              <Search size={16} /> Look up
            </button>
          </form>
        )}

        {/* ── Results ── */}
        {singleResult && singleResult !== "not_found" && (
          <div className={vStyles.results}>{renderVoucherResult(singleResult)}</div>
        )}

        {singleResult === "not_found" && (
          <div className={vStyles.notFound}>
            <CircleAlert size={24} />
            <div>
              <p className={vStyles.resultDeal}>No voucher found</p>
              <p className={vStyles.resultOption}>Double-check the input or ask for another redemption method.</p>
            </div>
          </div>
        )}

        {searchResult && searchResult.length > 0 && (
          <div className={vStyles.results}>
            <div className={vStyles.phoneResultHeader}>
              <User size={16} />
              <span><strong>{searchResult[0].customer}</strong> — {searchResult.length} voucher{searchResult.length > 1 ? "s" : ""}</span>
            </div>
            {searchResult.map((v) => renderVoucherResult(v))}
          </div>
        )}
      </section>

      {/* Voucher Rules */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Voucher rules</h2>
            <p className={styles.sectionSubtitle}>Check before service delivery.</p>
          </div>
        </div>
        <div className={styles.activityList}>
          <article className={styles.activityItem}><Ticket size={20} /><div><p className={styles.itemTitle}>One-time redemption</p><p className={styles.itemMeta}>A voucher cannot be used twice.</p></div></article>
          <article className={styles.activityItem}><CheckCircle2 size={20} /><div><p className={styles.itemTitle}>Match the service option</p><p className={styles.itemMeta}>Confirm package, duration, and valid days.</p></div></article>
          <article className={styles.activityItem}><CircleAlert size={20} /><div><p className={styles.itemTitle}>Escalate blocked vouchers</p><p className={styles.itemMeta}>Refunded or expired vouchers need support.</p></div></article>
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent activity</h2>
            <p className={styles.sectionSubtitle}>Latest redemptions and validations.</p>
          </div>
        </div>
        <div className={styles.desktopOnly}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Ref</th><th>Customer</th><th>Deal</th><th>OTP</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {allVouchers.slice(0, 10).map((v) => (
                  <tr key={v.code}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{v.refId}</td>
                    <td>{v.customer}</td><td>{v.deal}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{v.otp}</td>
                    <td><span className={isRedeemed(v) ? styles.neutralBadge : v.status === "Expired" ? styles.dangerBadge : styles.successBadge}>{isRedeemed(v) ? "Redeemed" : v.status}</span></td>
                    <td>{v.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.mobileCardList}>
          {allVouchers.slice(0, 10).map((v) => (
            <div className={styles.mobileCard} key={v.code}>
              <div className={styles.mobileCardHead}><p className={styles.itemTitle}>{v.customer}</p><span className={isRedeemed(v) ? styles.neutralBadge : v.status === "Expired" ? styles.dangerBadge : styles.successBadge}>{isRedeemed(v) ? "Redeemed" : v.status}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Ref</span><span className={styles.mobileCardValue} style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>{v.refId}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>OTP</span><span className={styles.mobileCardValue} style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{v.otp}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Deal</span><span className={styles.mobileCardValue}>{v.deal}</span></div>
              <div className={styles.mobileCardRow}><span className={styles.mobileCardLabel}>Time</span><span className={styles.mobileCardValue}>{v.time}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

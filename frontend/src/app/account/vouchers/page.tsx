"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ticket, CalendarDays, CheckCircle2, QrCode,
  MapPin, ShoppingBag, Download, Copy, Phone, KeyRound, Hash, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEMO_DEALS } from "@/lib/demo-data";
import { formatBDT } from "@/lib/utils";
import styles from "./page.module.css";

type RedeemMethod = "qr" | "otp" | "refid" | "phone";

const MY_VOUCHERS = [
  {
    id: "v_123",
    code: "CPB-A7F3BC-M2K9X",
    otp: "482916",
    refId: "CPB-A7F3BC",
    customerPhone: "01700-000000",
    status: "ACTIVE" as const,
    deal: DEMO_DEALS[0],
    optionId: DEMO_DEALS[0].options[0].id,
    optionTitle: DEMO_DEALS[0].options[0].title,
    purchaseDate: "2026-04-15",
    expiryDate: "2026-05-15",
  },
  {
    id: "v_124",
    code: "CPB-KL9M2N-P3Q4R",
    otp: "739251",
    refId: "CPB-KL9M2N",
    customerPhone: "01700-000000",
    status: "REDEEMED" as const,
    deal: DEMO_DEALS[1],
    optionId: DEMO_DEALS[1].options[0].id,
    optionTitle: DEMO_DEALS[1].options[0].title,
    purchaseDate: "2026-04-10",
    expiryDate: "2026-04-30",
    redeemedDate: "2026-04-12",
  },
];

const METHOD_TABS: { key: RedeemMethod; label: string; icon: typeof QrCode }[] = [
  { key: "qr", label: "QR Code", icon: QrCode },
  { key: "otp", label: "OTP", icon: KeyRound },
  { key: "refid", label: "Ref ID", icon: Hash },
  { key: "phone", label: "Phone", icon: Phone },
];

export default function VouchersPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "REDEEMED" | "EXPIRED">("ACTIVE");
  const [activeMethod, setActiveMethod] = useState<Record<string, RedeemMethod>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const filteredVouchers = MY_VOUCHERS.filter((v) => v.status === activeTab);

  function getMethod(voucherId: string): RedeemMethod {
    return activeMethod[voucherId] || "otp";
  }

  function setMethod(voucherId: string, method: RedeemMethod) {
    setActiveMethod((prev) => ({ ...prev, [voucherId]: method }));
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>My Vouchers</h1>
          <p className={styles.subtitle}>
            Present any of the redemption methods below to the merchant to redeem your deal.
          </p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === "ACTIVE" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ACTIVE")}>
            Available
          </button>
          <button className={`${styles.tab} ${activeTab === "REDEEMED" ? styles.tabActive : ""}`} onClick={() => setActiveTab("REDEEMED")}>
            Redeemed
          </button>
          <button className={`${styles.tab} ${activeTab === "EXPIRED" ? styles.tabActive : ""}`} onClick={() => setActiveTab("EXPIRED")}>
            Expired
          </button>
        </div>

        <div className={styles.vouchersList}>
          {filteredVouchers.length > 0 ? (
            filteredVouchers.map((voucher) => {
              const method = getMethod(voucher.id);
              return (
                <div key={voucher.id} className={`${styles.voucherCard} ${voucher.status !== "ACTIVE" ? styles.voucherInactive : ""}`}>
                  <div className={styles.voucherHeader}>
                    <div className={styles.merchantInfo}>
                      <p className={styles.merchantName}>{voucher.deal.merchant.businessName}</p>
                      <p className={styles.dealTitle}>{voucher.deal.title}</p>
                      <p className={styles.optionTitle}>{voucher.optionTitle}</p>
                    </div>
                    <div className={styles.qrPlaceholder}>
                      <QrCode size={48} />
                    </div>
                  </div>

                  <div className={styles.voucherDetails}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailItem}>
                        <MapPin size={16} />
                        <div>
                          <span>Location</span>
                          <p>{voucher.deal.merchant.address}, {voucher.deal.merchant.area}</p>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <CalendarDays size={16} />
                        <div>
                          <span>Expires On</span>
                          <p>{new Date(voucher.expiryDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {voucher.status === "REDEEMED" && (
                      <div className={styles.redeemedBadge}>
                        <CheckCircle2 size={16} />
                        Redeemed on {new Date(voucher.redeemedDate!).toLocaleDateString()}
                      </div>
                    )}

                    {voucher.status === "ACTIVE" && (
                      <div className={styles.redeemSection}>
                        <p className={styles.redeemTitle}>How to redeem</p>

                        {/* Method Tabs */}
                        <div className={styles.methodTabs}>
                          {METHOD_TABS.map((tab) => (
                            <button
                              key={tab.key}
                              className={`${styles.methodTab} ${method === tab.key ? styles.methodTabActive : ""}`}
                              onClick={() => setMethod(voucher.id, tab.key)}
                              type="button"
                            >
                              <tab.icon size={12} /> {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Method Content */}
                        <div className={styles.methodContent} key={method}>
                          {method === "qr" && (
                            <div className={styles.otpDisplay}>
                              <QrCode size={120} style={{ margin: "0 auto var(--space-3)", display: "block", color: "var(--color-gray-800)" }} />
                              <p className={styles.otpHint}>Show this QR code to the merchant for instant scan</p>
                              <button className={styles.resendBtn} type="button" onClick={() => copyToClipboard(voucher.code, `qr-${voucher.id}`)}>
                                <Download size={12} /> {copied === `qr-${voucher.id}` ? "Saved!" : "Save / Print"}
                              </button>
                            </div>
                          )}

                          {method === "otp" && (
                            <div className={styles.otpDisplay}>
                              <p className={styles.otpLabel}>Your One-Time Password</p>
                              <p className={styles.otpCode}>{voucher.otp}</p>
                              <p className={styles.otpHint}>Tell this OTP to the merchant. Sent to your phone &amp; email.</p>
                              <button className={styles.resendBtn} type="button">
                                <RefreshCw size={12} /> Resend OTP
                              </button>
                            </div>
                          )}

                          {method === "refid" && (
                            <>
                              <div className={styles.refDisplay}>
                                <span className={styles.refCode}>{voucher.refId}</span>
                                <button className={styles.copyBtn} type="button" onClick={() => copyToClipboard(voucher.refId, `ref-${voucher.id}`)}>
                                  <Copy size={12} /> {copied === `ref-${voucher.id}` ? "Copied!" : "Copy"}
                                </button>
                              </div>
                              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)", marginTop: "var(--space-2)" }}>
                                Show or tell this reference ID to the merchant
                              </p>
                            </>
                          )}

                          {method === "phone" && (
                            <div className={styles.phoneInfo}>
                              <Phone size={20} />
                              <div className={styles.phoneText}>
                                <strong>Just tell the merchant your phone number</strong>
                                <span>Registered: {voucher.customerPhone} — the merchant will look up your voucher and verify with OTP</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={styles.actions} style={{ marginTop: "var(--space-4)" }}>
                          <Button variant="primary">
                            <Download size={16} /> Save / Print
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <Ticket size={48} className={styles.emptyIcon} />
              <h3>No {activeTab.toLowerCase()} vouchers found</h3>
              <p>You don&apos;t have any vouchers in this category right now.</p>
              <Link href="/">
                <Button variant="primary">Browse Deals</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

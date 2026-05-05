import Link from "next/link";
import { Shield, CreditCard } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer */}
      <div className={styles.mainFooter}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand */}
            <div className={styles.brand}>
              <Link href="/" className={styles.logo}>
                <span className={styles.logoIcon}>C</span>
                <span className={styles.logoText}>{SITE_NAME}</span>
              </Link>
              <p className={styles.tagline}>
                Discover amazing deals from local businesses across Bangladesh.
                Save up to 90% on dining, beauty, travel, and more.
              </p>
              <div className={styles.paymentBadges}>
                <span className={styles.paymentBadge}>
                  <CreditCard size={14} />
                  bKash
                </span>
                <span className={styles.paymentBadge}>
                  <Shield size={14} />
                  Secure
                </span>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className={styles.columnTitle}>Company</h4>
              <ul className={styles.list}>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/press">Press</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* For Merchants */}
            <div>
              <h4 className={styles.columnTitle}>For Merchants</h4>
              <ul className={styles.list}>
                <li><Link href="/merchant">Join Marketplace</Link></li>
                <li><Link href="/merchant/how-it-works">How It Works</Link></li>
                <li><Link href="/merchant/success-stories">Success Stories</Link></li>
                <li><Link href="/merchant/dashboard">Merchant Center</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className={styles.columnTitle}>Support</h4>
              <ul className={styles.list}>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/refunds">Refund Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/privacy">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className={styles.bottom}>
            <p className={styles.copyright}>
              &copy; 2026 {SITE_NAME}. All rights reserved.
            </p>
            <div className={styles.bottomLinks}>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

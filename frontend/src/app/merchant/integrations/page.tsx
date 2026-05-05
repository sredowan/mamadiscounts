"use client";

import { useEffect, useState } from "react";
import {
  Check, ClipboardCopy, Code2, Eye, EyeOff, Globe, Key,
  Puzzle, RefreshCw, ShoppingCart, Terminal, Zap,
} from "lucide-react";
import styles from "../merchant.module.css";
import iStyles from "./integrations.module.css";

type Tab = "widget" | "api" | "woocommerce";

export default function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>("widget");
  const [merchantId, setMerchantId] = useState("MERCHANT_12345");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [widgetColor, setWidgetColor] = useState("#10b981");
  const [widgetPos, setWidgetPos] = useState("bottom-right");
  const [widgetLocale, setWidgetLocale] = useState("en");

  useEffect(() => {
    Promise.resolve().then(() => {
      const savedKey = localStorage.getItem("cpb_merchant_api_key");
      if (savedKey) setApiKey(savedKey);
      const savedColor = localStorage.getItem("cpb_merchant_brand_color");
      if (savedColor) setWidgetColor(savedColor);
    });
  }, []);

  function generateApiKey() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const key = "cpb_live_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setApiKey(key);
    localStorage.setItem("cpb_merchant_api_key", key);
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const widgetSnippet = `<script
  src="https://couponusbd.com/widget/redeem.js"
  data-merchant-id="${merchantId}"
  data-theme="auto"
  data-position="${widgetPos}"
  data-color="${widgetColor}"
  data-locale="${widgetLocale}"
  data-callback="onCouponusRedeem">
</script>

<script>
  function onCouponusRedeem(result) {
    if (result.valid) {
      console.log("Discount: ৳" + result.discount);
      // Apply discount to your cart here
    }
  }
</script>`;

  const inlineSnippet = `<!-- Place where you want the form to appear -->
<div id="couponus-widget"></div>

<script
  src="https://couponusbd.com/widget/redeem.js"
  data-merchant-id="${merchantId}"
  data-position="inline"
  data-color="${widgetColor}">
</script>`;

  const curlValidate = `curl -X POST https://couponusbd.com/api/voucher/validate \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "merchantId": "${merchantId}",
    "code": "CPB-A7F3BC",
    "orderAmount": 5000
  }'`;

  const curlRedeem = `curl -X POST https://couponusbd.com/api/voucher/redeem \\
  -H "Authorization: Bearer ${apiKey || "YOUR_API_KEY"}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "merchantId": "${merchantId}",
    "voucherId": "voucher_id_from_validate",
    "orderId": "YOUR_ORDER_ID"
  }'`;

  const jsExample = `// Node.js / Express example
const response = await fetch("https://couponusbd.com/api/voucher/validate", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey || "YOUR_API_KEY"}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    merchantId: "${merchantId}",
    code: req.body.couponCode,
    orderAmount: cart.total,
  }),
});

const data = await response.json();
if (data.valid) {
  cart.discount = data.discount;
  cart.couponusVoucherId = data.voucherId;
}`;

  const TABS: { key: Tab; label: string; icon: typeof Code2; desc: string }[] = [
    { key: "widget", label: "JS Widget", icon: Code2, desc: "Copy-paste embed" },
    { key: "api", label: "REST API", icon: Terminal, desc: "Direct integration" },
    { key: "woocommerce", label: "WooCommerce", icon: ShoppingCart, desc: "WordPress plugin" },
  ];

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Puzzle size={16} /> Online integration</span>
          <h1 className={styles.heroTitle}>Accept vouchers online</h1>
          <p className={styles.heroText}>Let customers redeem Couponus vouchers on your website checkout.</p>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.heroPanelLabel}>Integration status</p>
          <p className={styles.heroPanelValue} style={{ fontSize: "1rem" }}>
            {apiKey ? "🟢 Active" : "⚪ Not set up"}
          </p>
          <p className={styles.heroPanelMeta}>{apiKey ? "API key configured" : "Generate key to start"}</p>
        </div>
      </section>

      {/* API Key Section */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>API credentials</h2>
            <p className={styles.sectionSubtitle}>Your merchant ID and API key for all integrations.</p>
          </div>
          <Key size={20} style={{ color: "var(--color-gray-400)" }} />
        </div>
        <div className={iStyles.credentialsGrid}>
          <div className={iStyles.credentialBox}>
            <span className={iStyles.credLabel}>Merchant ID</span>
            <div className={iStyles.credValue}>
              <code>{merchantId}</code>
              <button className={iStyles.copySmall} type="button" onClick={() => copyText(merchantId, "mid")}>
                {copied === "mid" ? <Check size={13} /> : <ClipboardCopy size={13} />}
              </button>
            </div>
          </div>
          <div className={iStyles.credentialBox}>
            <span className={iStyles.credLabel}>API Key</span>
            {apiKey ? (
              <div className={iStyles.credValue}>
                <code>{showKey ? apiKey : "cpb_live_••••••••••••••••"}</code>
                <button className={iStyles.copySmall} type="button" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button className={iStyles.copySmall} type="button" onClick={() => copyText(apiKey, "key")}>
                  {copied === "key" ? <Check size={13} /> : <ClipboardCopy size={13} />}
                </button>
              </div>
            ) : (
              <button className={iStyles.generateBtn} type="button" onClick={generateApiKey}>
                <RefreshCw size={14} /> Generate API key
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tab Selector */}
      <div className={iStyles.tabGrid}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${iStyles.tabCard} ${tab === t.key ? iStyles.tabCardActive : ""}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            <t.icon size={22} />
            <span className={iStyles.tabLabel}>{t.label}</span>
            <span className={iStyles.tabDesc}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* ── Widget Tab ── */}
      {tab === "widget" && (
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Embeddable widget</h2>
              <p className={styles.sectionSubtitle}>Paste this code in your website. Customers see a &ldquo;Have a Couponus voucher?&rdquo; button.</p>
            </div>
            <Zap size={20} style={{ color: "var(--color-gray-400)" }} />
          </div>

          {/* Config */}
          <div className={iStyles.widgetConfig}>
            <div className={iStyles.configRow}>
              <label className={iStyles.configLabel}>Position</label>
              <div className={iStyles.configOptions}>
                {["bottom-right", "bottom-left", "inline"].map((pos) => (
                  <button key={pos} className={`${iStyles.configChip} ${widgetPos === pos ? iStyles.configChipActive : ""}`} onClick={() => setWidgetPos(pos)} type="button">
                    {pos === "inline" ? "Inline" : pos === "bottom-right" ? "Bottom Right" : "Bottom Left"}
                  </button>
                ))}
              </div>
            </div>
            <div className={iStyles.configRow}>
              <label className={iStyles.configLabel}>Language</label>
              <div className={iStyles.configOptions}>
                {[["en", "English"], ["bn", "বাংলা"]].map(([val, label]) => (
                  <button key={val} className={`${iStyles.configChip} ${widgetLocale === val ? iStyles.configChipActive : ""}`} onClick={() => setWidgetLocale(val)} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className={iStyles.configRow}>
              <label className={iStyles.configLabel}>Color</label>
              <input type="color" value={widgetColor} onChange={(e) => setWidgetColor(e.target.value)} className={iStyles.configColor} />
            </div>
          </div>

          {/* Code Block */}
          <div className={iStyles.codeBlock}>
            <div className={iStyles.codeHeader}>
              <span>{widgetPos === "inline" ? "Inline embed" : "Floating button"} — HTML</span>
              <button className={iStyles.copyCodeBtn} type="button" onClick={() => copyText(widgetPos === "inline" ? inlineSnippet : widgetSnippet, "widget")}>
                {copied === "widget" ? <><Check size={13} /> Copied</> : <><ClipboardCopy size={13} /> Copy</>}
              </button>
            </div>
            <pre className={iStyles.codeContent}><code>{widgetPos === "inline" ? inlineSnippet : widgetSnippet}</code></pre>
          </div>

          {/* How it works */}
          <div className={iStyles.howItWorks}>
            <h3 className={iStyles.howTitle}>How it works</h3>
            <div className={iStyles.steps}>
              {[
                { num: "1", text: "Paste the code in your checkout page" },
                { num: "2", text: "Customer clicks \"Have a Couponus voucher?\"" },
                { num: "3", text: "Customer enters their Ref ID" },
                { num: "4", text: "Widget validates and returns discount" },
                { num: "5", text: "Your callback applies the discount" },
              ].map((s) => (
                <div className={iStyles.step} key={s.num}>
                  <span className={iStyles.stepNum} style={{ background: widgetColor }}>{s.num}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── API Tab ── */}
      {tab === "api" && (
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>REST API reference</h2>
              <p className={styles.sectionSubtitle}>Integrate directly from your backend for full control.</p>
            </div>
            <Terminal size={20} style={{ color: "var(--color-gray-400)" }} />
          </div>

          {/* Endpoints */}
          <div className={iStyles.endpointList}>
            {/* Validate */}
            <div className={iStyles.endpoint}>
              <div className={iStyles.endpointHeader}>
                <span className={iStyles.methodBadge} style={{ background: "#dbeafe", color: "#1d4ed8" }}>POST</span>
                <code className={iStyles.endpointPath}>/api/voucher/validate</code>
              </div>
              <p className={iStyles.endpointDesc}>Validate a voucher code and get discount information.</p>
              <div className={iStyles.codeBlock}>
                <div className={iStyles.codeHeader}>
                  <span>cURL</span>
                  <button className={iStyles.copyCodeBtn} type="button" onClick={() => copyText(curlValidate, "curl1")}>
                    {copied === "curl1" ? <><Check size={13} /> Copied</> : <><ClipboardCopy size={13} /> Copy</>}
                  </button>
                </div>
                <pre className={iStyles.codeContent}><code>{curlValidate}</code></pre>
              </div>
              <div className={iStyles.responseExample}>
                <span className={iStyles.responseLabel}>Response (200 OK)</span>
                <pre className={iStyles.codeContent}><code>{`{
  "valid": true,
  "discount": 2500,
  "discountFormatted": "৳2,500",
  "dealTitle": "Luxury Thai Spa Package — 60-Min Thai Massage",
  "voucherId": "voucher_abc123",
  "expiresAt": "2026-05-29T00:00:00Z"
}`}</code></pre>
              </div>
            </div>

            {/* Redeem */}
            <div className={iStyles.endpoint}>
              <div className={iStyles.endpointHeader}>
                <span className={iStyles.methodBadge} style={{ background: "#dcfce7", color: "#166534" }}>POST</span>
                <code className={iStyles.endpointPath}>/api/voucher/redeem</code>
              </div>
              <p className={iStyles.endpointDesc}>Confirm redemption after payment is complete. Call this once the order is finalized.</p>
              <div className={iStyles.codeBlock}>
                <div className={iStyles.codeHeader}>
                  <span>cURL</span>
                  <button className={iStyles.copyCodeBtn} type="button" onClick={() => copyText(curlRedeem, "curl2")}>
                    {copied === "curl2" ? <><Check size={13} /> Copied</> : <><ClipboardCopy size={13} /> Copy</>}
                  </button>
                </div>
                <pre className={iStyles.codeContent}><code>{curlRedeem}</code></pre>
              </div>
            </div>

            {/* Node.js Example */}
            <div className={iStyles.endpoint}>
              <div className={iStyles.endpointHeader}>
                <span className={iStyles.methodBadge} style={{ background: "#fef3c7", color: "#92400e" }}>JS</span>
                <code className={iStyles.endpointPath}>Node.js / Express example</code>
              </div>
              <div className={iStyles.codeBlock}>
                <div className={iStyles.codeHeader}>
                  <span>JavaScript</span>
                  <button className={iStyles.copyCodeBtn} type="button" onClick={() => copyText(jsExample, "js")}>
                    {copied === "js" ? <><Check size={13} /> Copied</> : <><ClipboardCopy size={13} /> Copy</>}
                  </button>
                </div>
                <pre className={iStyles.codeContent}><code>{jsExample}</code></pre>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WooCommerce Tab ── */}
      {tab === "woocommerce" && (
        <section className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>WooCommerce plugin</h2>
              <p className={styles.sectionSubtitle}>One-click coupon integration for WordPress stores.</p>
            </div>
            <ShoppingCart size={20} style={{ color: "var(--color-gray-400)" }} />
          </div>

          <div className={iStyles.wooOverview}>
            <div className={iStyles.wooCard}>
              <Globe size={24} style={{ color: widgetColor }} />
              <h3>Auto checkout discount</h3>
              <p>Customers enter their Couponus Ref ID at WooCommerce checkout. The plugin validates and applies the discount automatically — no code needed from you.</p>
            </div>
            <div className={iStyles.wooCard}>
              <Zap size={24} style={{ color: widgetColor }} />
              <h3>5-minute setup</h3>
              <p>Install the plugin, paste your Merchant ID and API key, and you&apos;re live. Works with all WooCommerce themes.</p>
            </div>
            <div className={iStyles.wooCard}>
              <Key size={24} style={{ color: widgetColor }} />
              <h3>Secure server-side</h3>
              <p>Validation happens on your WordPress server → Couponus API. No client-side exposure of API keys.</p>
            </div>
          </div>

          <div className={iStyles.wooArchitecture}>
            <h3 className={iStyles.howTitle}>Plugin architecture</h3>
            <div className={iStyles.archFlow}>
              {[
                { label: "Customer enters Ref ID", sub: "WooCommerce checkout" },
                { label: "Plugin calls Couponus API", sub: "Server-side validation" },
                { label: "Discount applied to cart", sub: "WooCommerce coupon system" },
                { label: "After payment → auto-redeem", sub: "order_completed hook" },
              ].map((s, i) => (
                <div className={iStyles.archStep} key={i}>
                  <span className={iStyles.archNum} style={{ background: widgetColor }}>{i + 1}</span>
                  <div>
                    <p className={iStyles.archLabel}>{s.label}</p>
                    <p className={iStyles.archSub}>{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={iStyles.wooFiles}>
            <h3 className={iStyles.howTitle}>Plugin file structure</h3>
            <div className={iStyles.codeBlock}>
              <div className={iStyles.codeHeader}><span>couponus-bd-woocommerce/</span></div>
              <pre className={iStyles.codeContent}><code>{`couponus-bd-woocommerce/
├── couponus-bd.php              # Main plugin file
├── includes/
│   ├── class-couponus-api.php   # API client (validate, redeem)
│   ├── class-couponus-checkout.php  # Checkout field + apply discount
│   └── class-couponus-admin.php # Settings page (Merchant ID, API Key)
├── assets/
│   ├── css/checkout-field.css   # Styled input at checkout
│   └── js/checkout.js           # AJAX validation on input
├── templates/
│   └── checkout-field.php       # Coupon input field template
└── readme.txt                   # WordPress readme`}</code></pre>
            </div>
          </div>

          <div className={iStyles.wooCta}>
            <h3 className={iStyles.howTitle}>Installation</h3>
            <div className={iStyles.steps}>
              {[
                { num: "1", text: "Download the couponus-bd plugin folder" },
                { num: "2", text: "Upload to /wp-content/plugins/ on your WordPress server" },
                { num: "3", text: "Activate through WordPress admin → Plugins" },
                { num: "4", text: "Go to WooCommerce → Couponus BD settings" },
                { num: "5", text: "Paste your Merchant ID and API key, save — you're live!" },
              ].map((s) => (
                <div className={iStyles.step} key={s.num}>
                  <span className={iStyles.stepNum} style={{ background: widgetColor }}>{s.num}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)" }}>
              <a href="/downloads/couponus-bd.zip" download className={styles.primaryButton} style={{ textDecoration: "none" }}>
                <ShoppingCart size={16} /> Download Plugin v1.0.0
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

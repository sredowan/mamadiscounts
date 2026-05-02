"use client";

import { ChangeEvent, useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Camera, Download, Eye, Image as ImageIcon,
  Layout, Palette, ReceiptText, Sparkles,
} from "lucide-react";
import {
  BANNER_TEMPLATES, VOUCHER_TEMPLATES,
  type TemplateDefinition, type TemplateData, type TemplateType,
} from "@/lib/template-definitions";
import { normalizePromotionImage } from "@/lib/promotion-image";
import { BannerTemplate } from "@/components/templates/BannerTemplate";
import { VoucherTemplate } from "@/components/templates/VoucherTemplate";
import styles from "../../merchant.module.css";
import tplStyles from "./templates.module.css";

function readFile(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function MerchantTemplatesPage() {
  const [activeTab, setActiveTab] = useState<TemplateType>("banner");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition>(BANNER_TEMPLATES[0]);
  const [shopLogo, setShopLogo] = useState("");
  const [productImage, setProductImage] = useState("");
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [discountText, setDiscountText] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const templates = activeTab === "banner" ? BANNER_TEMPLATES : VOUCHER_TEMPLATES;

  function switchTab(tab: TemplateType) {
    setActiveTab(tab);
    const list = tab === "banner" ? BANNER_TEMPLATES : VOUCHER_TEMPLATES;
    setSelectedTemplate(list[0]);
  }

  async function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setShopLogo(await readFile(file));
  }

  async function handleProduct(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setProductImage(await normalizePromotionImage(file, activeTab === "banner" ? "main_banner" : "sponsored_voucher"));
  }

  const templateData: TemplateData = {
    templateId: selectedTemplate.id,
    shopLogo,
    productImage,
    headline,
    subtext,
    discountText,
    merchantName: merchantName || "Your Shop",
  };

  /* ── Download as PNG via html2canvas (dynamically imported) ── */
  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, "-")}-${activeTab}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Download failed. Please try again.");
    }
  }, [selectedTemplate.name, activeTab]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div>
          <Link href="/merchant/promotions" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-gray-400)", fontSize: "var(--text-sm)", marginBottom: "var(--space-2)", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Back to Promotions
          </Link>
          <span className={styles.eyebrow}><Palette size={16} /> Template Builder</span>
          <h1 className={styles.heroTitle}>Design your promotional materials</h1>
          <p className={styles.heroText}>Choose from 20 branded templates. Upload your logo and product photos — we handle the design.</p>
        </div>
      </section>

      {/* Tabs */}
      <div className={tplStyles.tabBar}>
        <button
          className={`${tplStyles.tab} ${activeTab === "banner" ? tplStyles.tabActive : ""}`}
          onClick={() => switchTab("banner")}
        >
          <Layout size={16} /> Banners ({BANNER_TEMPLATES.length})
        </button>
        <button
          className={`${tplStyles.tab} ${activeTab === "voucher" ? tplStyles.tabActive : ""}`}
          onClick={() => switchTab("voucher")}
        >
          <ReceiptText size={16} /> Vouchers ({VOUCHER_TEMPLATES.length})
        </button>
      </div>

      <section className={tplStyles.mainGrid}>
        {/* LEFT: Template Selector + Form */}
        <div className={tplStyles.leftPanel}>
          {/* Template Grid */}
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Choose a template</h2>
                <p className={styles.sectionSubtitle}>{templates.length} {activeTab} styles available</p>
              </div>
            </div>
            <div className={tplStyles.templateGrid}>
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className={`${tplStyles.templateCard} ${selectedTemplate.id === tpl.id ? tplStyles.templateCardSelected : ""}`}
                  onClick={() => setSelectedTemplate(tpl)}
                >
                  <div
                    className={tplStyles.templateSwatch}
                    style={{ background: tpl.previewAccent }}
                  />
                  <span className={tplStyles.templateName}>{tpl.name}</span>
                  <span className={tplStyles.templateDesc}>{tpl.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Customization Form */}
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Customize your {activeTab}</h2>
                <p className={styles.sectionSubtitle}>Fill in your details and upload images.</p>
              </div>
            </div>
            <div className={tplStyles.formGrid}>
              <div className={tplStyles.field}>
                <label>Shop / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Serenity Spa"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                />
              </div>
              <div className={tplStyles.field}>
                <label>Discount Text</label>
                <input
                  type="text"
                  placeholder="e.g. 50% OFF"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                />
              </div>
              <div className={tplStyles.field} style={{ gridColumn: "1 / -1" }}>
                <label>Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Spa Package"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
              <div className={tplStyles.field} style={{ gridColumn: "1 / -1" }}>
                <label>Subtext</label>
                <input
                  type="text"
                  placeholder="e.g. Valid until June 30"
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                />
              </div>
              <div className={tplStyles.field}>
                <label><Camera size={14} /> Shop Logo</label>
                <input type="file" accept="image/*" onChange={handleLogo} />
                {shopLogo && (
                  <img src={shopLogo} alt="Logo preview" className={tplStyles.miniPreview} />
                )}
              </div>
              <div className={tplStyles.field}>
                <label><ImageIcon size={14} /> Product Photo</label>
                <input type="file" accept="image/*" onChange={handleProduct} />
                {productImage && (
                  <img src={productImage} alt="Product preview" className={tplStyles.miniPreview} />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={tplStyles.actionBar}>
              <button
                type="button"
                className={tplStyles.previewBtn}
                onClick={() => setShowPreview(true)}
              >
                <Eye size={16} /> Full Preview
              </button>
              <button
                type="button"
                className={tplStyles.downloadBtn}
                onClick={handleDownload}
              >
                <Download size={16} /> Download PNG
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className={tplStyles.rightPanel}>
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}><Sparkles size={16} /> Live Preview</h2>
                <p className={styles.sectionSubtitle}>Updates as you type</p>
              </div>
            </div>
            <div className={tplStyles.previewContainer} ref={previewRef}>
              {activeTab === "banner" ? (
                <BannerTemplate data={templateData} styleKey={selectedTemplate.styleKey} />
              ) : (
                <VoucherTemplate data={templateData} styleKey={selectedTemplate.styleKey} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Preview Modal */}
      {showPreview && (
        <div className={tplStyles.modal} onClick={() => setShowPreview(false)}>
          <div className={tplStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={tplStyles.modalClose} onClick={() => setShowPreview(false)}>&times;</button>
            <div ref={previewRef}>
              {activeTab === "banner" ? (
                <BannerTemplate data={templateData} styleKey={selectedTemplate.styleKey} />
              ) : (
                <VoucherTemplate data={templateData} styleKey={selectedTemplate.styleKey} />
              )}
            </div>
            <button className={tplStyles.downloadBtn} onClick={handleDownload} style={{ marginTop: "var(--space-4)", width: "100%" }}>
              <Download size={16} /> Download as PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

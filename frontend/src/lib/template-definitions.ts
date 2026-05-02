/* ============================================================
   COUPONUS BD — Branded Template Definitions
   10 Banner Templates + 10 Voucher Templates
   ============================================================ */

export type TemplateType = "banner" | "voucher";

export interface TemplateDefinition {
  id: string;
  type: TemplateType;
  name: string;
  description: string;
  /** CSS class suffix used in the template component */
  styleKey: string;
  /** Preview accent color for the selector grid */
  previewAccent: string;
}

/* ── Banner Templates (horizontal, slider-sized) ──────────── */
export const BANNER_TEMPLATES: TemplateDefinition[] = [
  { id: "b1",  type: "banner", name: "Premium Emerald",  description: "Glassmorphism overlay on deep emerald gradient",       styleKey: "emeraldBold",    previewAccent: "#059669" },
  { id: "b2",  type: "banner", name: "Rose Gold Luxury", description: "Soft rose gold light with sleek typography", styleKey: "sunsetDiagonal", previewAccent: "#fda4af" },
  { id: "b3",  type: "banner", name: "Midnight Luxe",    description: "Deep obsidian backdrop with refined gold accents",    styleKey: "darkPremium",    previewAccent: "#111827" },
  { id: "b4",  type: "banner", name: "Ocean Glass",      description: "Blurred frosted glass over deep teal gradients",      styleKey: "tealWaves",      previewAccent: "#0f766e" },
  { id: "b5",  type: "banner", name: "Platinum Split",   description: "Sleek 50/50 split of pristine platinum and image",    styleKey: "splitDuo",       previewAccent: "#9ca3af" },
  { id: "b6",  type: "banner", name: "Pearl Minimal",    description: "Soft pearl white with subtle silver drop shadows",       styleKey: "minimalWhite",   previewAccent: "#f3f4f6" },
  { id: "b7",  type: "banner", name: "Amethyst Glow",    description: "Deep violet to midnight blue radial blur",    styleKey: "gradientBurst",  previewAccent: "#5b21b6" },
  { id: "b8",  type: "banner", name: "Cyber Chrome",     description: "Dark metallic surface with cyan/magenta neon text",  styleKey: "neonPop",        previewAccent: "#0ea5e9" },
  { id: "b9",  type: "banner", name: "Cinematic Vignette",description: "Heavy filmic vignette with crisp white typography",    styleKey: "photoFocus",     previewAccent: "#000000" },
  { id: "b10", type: "banner", name: "Royal Crimson",    description: "Deep rich red with elegant subtle gold shimmer",     styleKey: "festive",        previewAccent: "#991b1b" },
];

/* ── Voucher Templates (horizontal homepage voucher cards) ── */
export const VOUCHER_TEMPLATES: TemplateDefinition[] = [
  { id: "v1",  type: "voucher", name: "Frosted Ticket",  description: "Ultra-modern glassmorphic ticket with soft borders",        styleKey: "classicVoucher", previewAccent: "#e5e7eb" },
  { id: "v2",  type: "voucher", name: "Emerald Card",    description: "Premium metallic green card surface", styleKey: "emeraldPass",    previewAccent: "#065f46" },
  { id: "v3",  type: "voucher", name: "Golden Ticket",   description: "Rich brushed gold gradient with deep dark text",          styleKey: "goldCard",       previewAccent: "#d97706" },
  { id: "v4",  type: "voucher", name: "Obsidian Chit",   description: "Matte black card with silver foil typography",          styleKey: "minimalChit",    previewAccent: "#1f2937" },
  { id: "v5",  type: "voucher", name: "Ivory Split",     description: "Crisp ivory lower half, cinematic photo upper half",      styleKey: "photoTop",       previewAccent: "#fafafa" },
  { id: "v6",  type: "voucher", name: "Crimson Seal",    description: "Deep red velvet card with stark white seal badge",            styleKey: "circularBadge",  previewAccent: "#991b1b" },
  { id: "v7",  type: "voucher", name: "Violet Pass",     description: "Deep violet premium gradient with dashed modern cuts",             styleKey: "ticketStyle",    previewAccent: "#6d28d9" },
  { id: "v8",  type: "voucher", name: "Sapphire Stack",  description: "Elegant deep blue tones stacked harmoniously",        styleKey: "gradientStack",  previewAccent: "#0369a1" },
  { id: "v9",  type: "voucher", name: "Onyx Exclusive",  description: "Pure onyx black backdrop with a subtle gold ribbon",          styleKey: "darkExclusive",  previewAccent: "#09090b" },
  { id: "v10", type: "voucher", name: "Amber Glow",      description: "Warm amber gradients with soft dimensional lighting",    styleKey: "festiveGift",    previewAccent: "#d97706" },
];

export const ALL_TEMPLATES = [...BANNER_TEMPLATES, ...VOUCHER_TEMPLATES];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

/** Data a merchant fills in for any template */
export interface TemplateData {
  templateId: string;
  shopLogo: string;        // data URL
  productImage: string;    // data URL
  headline: string;        // e.g. "50% OFF Thai Massage"
  subtext: string;         // e.g. "Valid until June 30"
  discountText: string;    // e.g. "50%"
  merchantName: string;
}

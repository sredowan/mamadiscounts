# Deal Details vs. Merchant Creation — Gap Analysis

Comparison of what the **deal detail page** (`/deals/[slug]`) renders vs. what the **merchant deal creation form** (`/merchant/deals/new`) actually captures.

## Summary

The creation form covers the basics but is **missing several fields** that the detail page displays prominently. The deal-store `createManagedDeal()` function fills many gaps with hardcoded defaults, which masks the problem.

## Field-by-Field Comparison

| Field | Detail Page Shows? | Creation Form Captures? | Status |
|---|---|---|---|
| **Title** | ✅ h1 heading | ✅ `title` input | ✅ OK |
| **Description** | ✅ "About This Deal" tab | ✅ `description` textarea | ✅ OK |
| **Category** | ✅ breadcrumb + badge | ✅ template selection → auto-set | ✅ OK |
| **Original Price** | ✅ struck-through | ✅ `originalPrice` input | ✅ OK |
| **Deal Price** | ✅ green price | ✅ `dealPrice` input | ✅ OK |
| **Discount %** | ✅ red badge | ⚙️ Auto-calculated in `createManagedDeal` | ✅ OK (derived) |
| **Voucher Qty Cap** | ❌ Not shown (but used internally) | ✅ `quantity` input | ✅ OK |
| **Per-Customer Limit** | ✅ quantity picker max | ✅ `limit` input | ✅ OK |
| **Redemption Method** | ✅ fine print tab | ✅ `redemption` select | ✅ OK |
| **Validity / Expiry** | ✅ fine print tab | ✅ `expiry` input | ✅ OK |
| **Cover Image** | ✅ main gallery image | ✅ file upload | ✅ OK |
| **Gallery Images** | ✅ image nav arrows | ✅ multi-file upload (6 max) | ✅ OK |
| **Highlights** | ✅ "What's Included" bullets | ❌ **NOT captured** | ❌ **MISSING** |
| **Fine Print** | ✅ "Fine Print" tab (6 bullets) | ❌ **NOT captured** (hardcoded generic) | ❌ **MISSING** |
| **Extra Discount** | ✅ "Extra ৳200 off" label | ❌ **NOT captured** | ❌ **MISSING** |
| **Extra Discount Label** | ✅ shown under price | ❌ **NOT captured** | ❌ **MISSING** |
| **Start Date** | ✅ fine print "Valid from X" | ❌ **NOT captured** (hardcoded to `now()`) | ❌ **MISSING** |
| **End Date** | ✅ fine print "Valid to X" | ❌ **NOT captured** (hardcoded to +90 days) | ❌ **MISSING** |
| **Deal Options** | ✅ radio selector (multi-tier pricing) | ❌ **NOT captured** (hardcoded single option) | ❌ **MISSING** |
| **Badges** | ✅ card badge (Popular/New/etc.) | ❌ **NOT captured** (hardcoded `["new","verified"]`) | ❌ **MISSING** |

## Critical Missing Features

> [!IMPORTANT]
> ### 1. Highlights (What's Included)
> The detail page renders a bullet list under "What's Included". The form has no field for this. Currently hardcoded from `[categoryName, redemptionMethod, validity]`.

> [!IMPORTANT]
> ### 2. Deal Options (Multi-Tier Pricing)
> The detail page shows a radio selector for multiple price tiers (e.g., "60-Min Massage ৳1,999" vs. "90-Min Royal ৳2,999"). The form only captures a **single** original/deal price pair. Merchants need the ability to add multiple options.

> [!WARNING]
> ### 3. Fine Print
> The detail page shows 6 fine-print bullets, but they're **entirely hardcoded** in the detail page. The form has no field for merchant-specific fine print. The `createManagedDeal` generates a generic one-liner.

> [!WARNING]
> ### 4. Start/End Dates
> The form has no date picker. Deals are auto-set to start today and expire in 90 days. Merchants should control their campaign window.

## Less Critical Gaps

- **Extra Discount / Label**: Promotional price-cut. Could be admin-only (set during campaigns).
- **Badges**: Could remain admin-controlled (Popular = auto-assigned by sales volume, Verified = admin approval).
- **Merchant location data**: The form doesn't capture `latitude`/`longitude`. The `createManagedDeal` hardcodes a default merchant with Gulshan coordinates. This affects the "Deals Near You" geo-sorting.

## Recommendation

Add these fields to the creation form to close the gap:

1. **Highlights** — multi-input (add/remove bullets) for "What's Included"
2. **Deal Options** — repeatable tier builder (title + originalPrice + dealPrice per tier)
3. **Fine Print** — multi-input or textarea for merchant-specific terms
4. **Start Date / End Date** — date pickers
5. **Merchant lat/lng** — either auto-geocode from address or let merchant pin on a map

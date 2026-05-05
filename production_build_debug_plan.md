# 🔧 COUPONUS BD — Production Build Debug Report & Fix Plan

## 📊 Current State Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Local `next build`** | ✅ **Passes** | 36 static pages, 4 dynamic routes — exit code 0 |
| **TypeScript** | ✅ Clean | No type errors during build |
| **Hostinger Runtime** | ❌ **Crashing** | `uv_thread_create` + 503s + white screens |
| **Dev Error Log** | ⚠️ 2.4MB of warnings | Duplicate keys, hydration mismatches |

> [!IMPORTANT]
> The build itself compiles fine locally. The real problems are **runtime crashes on Hostinger's constrained shared hosting** and **code-level bugs** that cause white screens and data failures in production.

---

## 🔴 Critical Issues (Production Blockers)

### 1. Hostinger `uv_thread_create` Native Thread Crash
**Root cause:** Hostinger shared hosting limits the number of native threads a Node.js process can create. Next.js 16 (Turbopack) with React 19 spawns worker threads that exceed this limit.

**Evidence:** 
- `server.js` already sets `UV_THREADPOOL_SIZE=1` and `--max-old-space-size=512`
- Previous conversations document repeated 503 errors and "Native stack" crashes
- The server spawns `next start` as a child process, adding overhead

**Files involved:**
- [server.js](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/server.js)
- [server.mjs](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/server.mjs)

> [!WARNING]
> You have **two competing server entry points** (`server.js` and `server.mjs`). The `.js` spawns Next.js as a child process; the `.mjs` does a unified single-process server with both Next.js + backend API. Only one should exist.

---

### 2. Empty `NEXT_PUBLIC_API_URL` in Production
**Root cause:** [.env.production](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/.env.production) has `NEXT_PUBLIC_API_URL=""`, which means the API URL falls through to the `typeof window` check in `utils.ts`, resolving to `/api` on client and `http://127.0.0.1:4000/api` on server — but **Hostinger's production server may not have port 4000 running**.

```
# Current (.env.production)
NEXT_PUBLIC_API_URL=""      ← EMPTY! No API endpoint configured
```

**Files involved:**
- [.env.production](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/.env.production)
- [utils.ts L77-81](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/lib/utils.ts#L77-L81)

---

### 3. Backend Credentials Still Placeholder
**Root cause:** [backend/.env.production](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/backend/.env.production) still has `CHANGE_ME` placeholders for database URL, JWT secret, and CORS frontend URL.

```
DATABASE_URL="mysql://CHANGE_ME_USER:CHANGE_ME_PASSWORD@CHANGE_ME_HOST:3306/CHANGE_ME_DATABASE"
JWT_SECRET="CHANGE_ME_GENERATE_A_LONG_RANDOM_SECRET"
FRONTEND_URL="https://CHANGE_ME_FRONTEND_DOMAIN"
```

---

## 🟡 Code Quality Issues (Warnings, But Can Cause White Screens)

### 4. Duplicate React Key: `dscc-Matuail`
**Root cause:** `DSCC_AREAS` has `"Matuail"` listed in **two different zones** (Jatrabari zone at line 159 AND Demra zone at line 172). When `DHAKA_AREAS` is flattened, both generate `slug: "matuail"` → same key used in React lists → duplicate key warning floods the error log.

**File:** [constants.ts L159, L172](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/lib/constants.ts#L159-L172)

```diff
 # Jatrabari zone (line 159):
      "Jatrabari", "Matuail", "Shyampur",
 # Demra zone (line 172):
-     "Demra", "Matuail", "Dhania",
+     "Demra", "Matuail (Demra)", "Dhania",
```

**Impact:** 2.4MB error log, React reconciliation errors, potential rendering crashes.

---

### 5. Hydration Mismatch
**Root cause:** Browser extension (`cz-shortcut-listen="true"`) adds attributes to `<body>` that don't exist in SSR HTML. This is cosmetic on dev but can mask real SSR/client mismatches in production.

**File:** [layout.tsx](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/layout.tsx)

**Fix:** Add `suppressHydrationWarning` to `<body>`:
```tsx
<body suppressHydrationWarning>
```

---

### 6. Missing `metadataBase` for Open Graph
**Warning:** `metadataBase property in metadata export is not set for resolving social open graph or twitter images`

**File:** [layout.tsx L24](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/layout.tsx#L24)

**Fix:** Add `metadataBase` to the metadata export:
```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://couponusbd.com"),
  // ... rest
};
```

---

### 7. `scroll-behavior: smooth` Warning
**Warning:** Next.js 16 requires `data-scroll-behavior="smooth"` on `<html>` for route transition support.

**File:** [layout.tsx L67-69](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/layout.tsx#L67-L69) + [globals.css](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/globals.css)

**Fix:** Add the attribute to the `<html>` tag:
```tsx
<html lang="en" data-scroll-behavior="smooth" className={...}>
```

---

## 🏗️ Architecture Issues

### 8. Two Server Entry Points
You have:
- `server.js` — CommonJS, spawns `next start` as a child process
- `server.mjs` — ESM, runs Next.js + Express API in a single process

**The `.mjs` approach is better** (single process = lower memory, unified routing), but it depends on `backend/dist/app.js` existing.

### 9. Dynamic Routes Require Node.js Server
The build shows 4 dynamic (`ƒ`) routes:
```
├ ƒ /brands/[slug]
├ ƒ /browse/[city]
├ ƒ /browse/[city]/[area]
├ ƒ /category/[slug]
├ ƒ /deals/[slug]
```

These need `next start` (Node.js server) to work. They **cannot** be served as static HTML from Hostinger's file manager. A previous conversation explored `output: "export"` for static deployment, but that removes these dynamic routes.

---

## 📋 Fix Plan — 6 Phases

### Phase 1: Fix Code Bugs (No Risk, No Deploy)
- [ ] Fix duplicate `"Matuail"` key in `constants.ts` 
- [ ] Add `suppressHydrationWarning` to `<body>`
- [ ] Add `metadataBase` to layout metadata
- [ ] Add `data-scroll-behavior="smooth"` to `<html>`
- [ ] Clear `dev.err.log` (2.4MB of noise)

### Phase 2: Fix Environment Config
- [ ] Set proper `NEXT_PUBLIC_API_URL` in `.env.production`
- [ ] Confirm backend credentials in `backend/.env.production`
- [ ] Decide: is backend API running on Hostinger? If yes, what port/URL?

### Phase 3: Consolidate Server Architecture
- [ ] Delete `server.js` (child-process approach wastes memory)
- [ ] Use `server.mjs` as the single entry point
- [ ] OR: If backend API isn't deployed on Hostinger, simplify to just `next start`

### Phase 4: Hostinger Optimization
- [ ] Set `NODE_OPTIONS="--max-old-space-size=384"` (Hostinger shared = very low RAM)
- [ ] Set `UV_THREADPOOL_SIZE=1`
- [ ] Consider adding `output: "standalone"` to `next.config.ts` for minimal deployment size
- [ ] Test `next start` with `--turbopack=false` (Turbopack may spawn extra threads)

### Phase 5: Build, Test, Deploy
- [ ] Run `npm run build` locally with production env
- [ ] Test with `npm run start` locally
- [ ] Git commit + push
- [ ] Deploy to Hostinger + monitor startup logs

### Phase 6: Long-term Improvements
- [ ] Consider migrating to a VPS (Hetzner/DigitalOcean $4/mo) to avoid Hostinger thread limits
- [ ] Set up health check endpoint
- [ ] Add error boundary + fallback UI for API failures

---

## ❓ Questions Before Proceeding

1. **Is the backend API actually deployed on Hostinger?** Or is the frontend the only thing deployed?
2. **Do you have Node.js app hosting on Hostinger?** (not just static file hosting)
3. **What's the production domain?** Is it `couponusbd.com`?
4. **Should I start fixing Phase 1 now?** The code bugs can be fixed immediately with no deployment risk.

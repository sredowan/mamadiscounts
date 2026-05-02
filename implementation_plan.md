# Merchant Dashboard Redesign Plan

This plan outlines the complete redesign of the Merchant Portal to provide a premium, app-like experience on mobile and a streamlined, modern interface on desktop. The redesign focuses on high-fidelity glassmorphism, micro-animations, and intuitive mobile-first navigation, all while strictly adhering to the existing Emerald Green brand colors.

## User Review Required

> [!IMPORTANT]
> Please review the proposed structural changes and confirm if the "Light Glassmorphism" aesthetic with the current Emerald Green (`--color-primary-500`) branding is exactly what you envision.

## Open Questions

> [!QUESTION]
> Are there any specific new features or widgets (e.g., a specific chart type or quick action) you'd like added to the dashboard during this redesign, or should we strictly re-layout the existing data?

## Proposed Changes

We will redesign both the `MerchantShell` (which handles the sidebar, topbar, and mobile navigation) and the `dashboard/page.tsx` (the main landing page).

---

### Navigation & Shell (MerchantShell)

The shell will be updated to feature a sleek mobile bottom navbar with floating icons, and a premium glassmorphic topbar and sidebar.

#### [MODIFY] [MerchantShell.tsx](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/components/merchant/MerchantShell.tsx)
- Redesign the `MOBILE_NAV` to use a floating bottom bar with active indicator dots.
- Update the desktop sidebar to use a blurred glass background (`backdrop-filter`) with subtle gradient borders.
- Enhance the top header on mobile to look like a native app header (centered title, trailing notification/profile icons).

#### [MODIFY] [MerchantShell.module.css](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/components/merchant/MerchantShell.module.css)
- Implement modern CSS for the new floating app-like bottom navigation.
- Add tilt/hover effects and micro-animations to sidebar navigation links.
- Use `rgba(255, 255, 255, 0.8)` with `backdrop-filter: blur(16px)` for the glassmorphic shell elements.

---

### Dashboard Landing Page

The main dashboard will be transformed from a traditional web page into a widget-based, app-like dashboard with horizontal scrolling elements and card-based design.

#### [MODIFY] [page.tsx](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/merchant/dashboard/page.tsx)
- Restructure the greeting section to be more compact and visually striking.
- Turn the `QUICK_ACTIONS` into a horizontal scrollable row (or a tight 2x2 grid on mobile) with prominent icons.
- Convert the stats and charts into unified glass cards with smooth gradient meshes in the background.

#### [MODIFY] [dashboard.module.css](file:///c:/Users/ADMIN/OneDrive/Documents/PERSONAL/DEVELOPMENTS/COUPONUS%20BD/frontend/src/app/merchant/dashboard/dashboard.module.css)
- Implement vibrant, premium CSS using the `var(--color-primary-500)` family.
- Add `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05)` to cards to give them depth.
- Create dynamic entrance animations (`keyframes` for sliding and fading in) so the dashboard feels alive when it loads.

## Verification Plan

### Manual Verification
- View the updated pages in a web browser using responsive design mode (mobile view) to ensure the bottom navbar and app-like header are perfectly positioned.
- Verify the desktop view to ensure the sidebar and content area scale correctly and look premium.
- Ensure no existing functionality (like routing or logging out) is broken.
